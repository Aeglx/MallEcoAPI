export interface MenuItem {
  id: string;
  title: string;
  name: string;
  path: string;
  level: number;
  frontRoute: string;
  parentId: string | null;
  sortOrder: number;
  permission: string;
  icon: string;
  description: string;
  type: number;
  appType: number;
  children?: MenuItem[];
}

export interface MenuTree extends MenuItem {
  children?: MenuTree[];
}

export interface WechatMenu {
  button: Array<{
    type?: string;
    name: string;
    key?: string;
    url?: string;
    sub_button?: Array<{
      type: string;
      name: string;
      key?: string;
      url?: string;
    }>;
  }>;
}