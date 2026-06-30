import { Client } from '@notionhq/client'

export function getNotionClient() {
  return new Client({ auth: process.env.NOTION_API_KEY })
}

export async function fetchNotionDatabase() {
  const notion = getNotionClient()
  const databaseId = process.env.NOTION_DATABASE_ID

  if (!databaseId) throw new Error('NOTION_DATABASE_ID is not set')

  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: '公開',
      checkbox: { equals: true },
    },
  } as Parameters<typeof notion.databases.query>[0])

  return response.results
}

// Map Notion page properties to reference_cards fields
// Expects these properties in Notion DB:
// - ブランド名 (title)
// - カテゴリ (select)
// - サマリー (rich_text)
// - 説明 (rich_text)
// - 売上成長率 (rich_text) - example metric
// - 公開 (checkbox)
// - 匿名 (checkbox)
export function mapNotionPageToCard(page: any) {
  const props = page.properties

  const getText = (prop: any) => {
    if (!prop) return ''
    if (prop.type === 'title') return prop.title?.[0]?.plain_text || ''
    if (prop.type === 'rich_text') return prop.rich_text?.[0]?.plain_text || ''
    if (prop.type === 'select') return prop.select?.name || ''
    if (prop.type === 'checkbox') return prop.checkbox ?? false
    return ''
  }

  // Collect metrics: any number-type or formula props can be mapped
  const metrics: Record<string, string> = {}
  for (const [key, val] of Object.entries(props) as any[]) {
    if (val.type === 'number' && val.number !== null) {
      metrics[key] = String(val.number)
    }
  }

  return {
    notion_page_id: page.id,
    brand_name: getText(props['ブランド名']) || null,
    category: getText(props['カテゴリ']) || '기타',
    summary: getText(props['サマリー']),
    description: getText(props['説明']),
    metrics: Object.keys(metrics).length > 0 ? metrics : {},
    image_urls: [] as string[],
    is_public: Boolean(getText(props['公開'])),
    is_anonymous: Boolean(getText(props['匿名'])),
  }
}
