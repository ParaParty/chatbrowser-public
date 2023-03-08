export interface ApiMsgAttr {
  databaseId: number
  platform: string
  sendTime: string
  fromGroupId: string
  fromUserId: string
  type: string
  content: string
  robotUserId: string
  fromGroupInfo: ApiGroupInfo
  fromUserInfo: ApiUserInfo
}

export interface ApiUserInfo {
  id: string
  nick: string
  fromGroupId: string
  displayName: string
  title: string
}

export interface ApiGroupInfo {
  id: string
  name: string
}

export type ApiMsgLinks = Record<string, JSONApiLink>

export type JSONApiLink = string

export interface ApiMsg {
  attributes: ApiMsgAttr
  id: string
  links: ApiMsgLinks
  type: string
}
