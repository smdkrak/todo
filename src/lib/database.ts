import type { Category, Notice, Task } from '../types'
import { supabase } from './supabase'

const requireClient = () => {
  if (!supabase) throw new Error('Supabase 환경변수가 설정되지 않았습니다.')
  return supabase
}

export async function loadTodoData() {
  const client = requireClient()
  const [categoriesResult, tasksResult, noticesResult] = await Promise.all([
    client.from('categories').select('id, name').order('created_at'),
    client.from('tasks').select('id, title, deadline, content, image_url, status, category_id, classification, sort_order').order('sort_order').order('created_at'),
    client.from('notices').select('id, text, date').order('created_at'),
  ])
  const error = categoriesResult.error ?? tasksResult.error ?? noticesResult.error
  if (error) throw error

  return {
    categories: (categoriesResult.data ?? []) as Category[],
    tasks: (tasksResult.data ?? []).map((row) => ({
      id: row.id,
      title: row.title,
      deadline: row.deadline ?? undefined,
      content: row.content ?? undefined,
      imageUrl: row.image_url ?? undefined,
      status: row.status,
      category: row.category_id,
      classification: row.classification ?? '',
      sortOrder: row.sort_order ?? 0,
    })) as Task[],
    notices: (noticesResult.data ?? []).map((row) => ({ id: row.id, text: row.text, date: row.date ?? undefined })) as Notice[],
  }
}

export async function saveCategory(userId: string, category: Category) {
  const { error } = await requireClient().from('categories').upsert({ user_id: userId, id: category.id, name: category.name })
  if (error) throw error
}

export async function saveTask(userId: string, task: Task) {
  const { error } = await requireClient().from('tasks').upsert({
    user_id: userId,
    id: task.id,
    title: task.title,
    deadline: task.deadline ?? null,
    content: task.content ?? null,
    image_url: task.imageUrl ?? null,
    status: task.status,
    category_id: task.category,
    classification: task.classification ?? '',
    sort_order: task.sortOrder ?? 0,
    updated_at: new Date().toISOString(),
  })
  if (error) throw error
}

export async function removeTask(id: string) {
  const { error } = await requireClient().from('tasks').delete().eq('id', id)
  if (error) throw error
}

export async function saveNotice(userId: string, notice: Notice) {
  const { error } = await requireClient().from('notices').upsert({ user_id: userId, id: notice.id, text: notice.text, date: notice.date ?? null, updated_at: new Date().toISOString() })
  if (error) throw error
}

export async function removeNotice(id: string) {
  const { error } = await requireClient().from('notices').delete().eq('id', id)
  if (error) throw error
}
