export const onRequestGet: PagesFunction = async ({ params }) => {
  try {
    const [host, ...paths] = params.param as string[]
    const path = paths.join('/')
    return await fetch(`https://${host}.qpic.cn/${path}`)
  }
  catch (e) {
    return new Response(String(e), { status: 500 })
  }
}
