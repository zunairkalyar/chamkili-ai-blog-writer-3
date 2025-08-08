
export interface ShopifyBlog {
  id: number;
  title: string;
}

export interface ShopifyCredentials {
  storeName: string;
  accessToken: string;
}

interface ShopifyMetafield {
  key: string;
  namespace: string;
  value: string;
  type: string;
}

const API_VERSION = '2024-07';
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';

async function shopifyFetch(url: string, creds: ShopifyCredentials, options: RequestInit = {}) {
  const { storeName, accessToken } = creds;
  if (!storeName || !accessToken) {
    throw new Error("Shopify store name and access token are required.");
  }
  
  const fullUrl = `${CORS_PROXY}https://${storeName}.myshopify.com/admin/api/${API_VERSION}/${url}`;

  const response = await fetch(fullUrl, {
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken,
      'X-Requested-With': 'XMLHttpRequest' 
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ errors: 'Unknown Shopify API error' }));
    throw new Error(`Shopify API Error: ${JSON.stringify(errorData.errors || errorData)}`);
  }

  return response.json();
}

export async function getBlogs(creds: ShopifyCredentials): Promise<ShopifyBlog[]> {
  const data = await shopifyFetch('blogs.json', creds);
  return data.blogs;
}

export async function createArticle(
  creds: ShopifyCredentials,
  blogId: number,
  generatedContent: string,
  metaTitle?: string,
  metaDescription?: string
): Promise<{ article: { id: number } }> {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = generatedContent;
  
  const h1 = tempDiv.querySelector('h1');
  const articleTitle = h1 ? h1.innerText.trim() : 'Untitled Post';
  if (h1) h1.remove();
  const articleBody = tempDiv.innerHTML;

  const metafields: ShopifyMetafield[] = [];
  if (metaTitle) {
    metafields.push({ key: 'title_tag', namespace: 'global', value: metaTitle, type: 'single_line_text_field' });
  }
  if (metaDescription) {
    metafields.push({ key: 'description_tag', namespace: 'global', value: metaDescription, type: 'single_line_text_field' });
  }

  const payload = {
    article: {
      title: articleTitle,
      author: 'Chamkili AI Writer',
      body_html: articleBody,
      published: true,
      ...(metafields.length > 0 && { metafields }),
    },
  };

  return await shopifyFetch(`blogs/${blogId}/articles.json`, creds, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
