export interface ConfigItem {
  name: string;
}

export interface ConfigSection {
  items: ConfigItem[];
}

export interface Root  {
  config: ConfigSection[];
}
