// These are very WIP

export interface ReplicatedApp {
  config: ConfigSection[];
  components: Component[];
}

export interface ConfigSection {
  items: ConfigOption[];
}

export interface Component {
  cluster_host_count: MinMax;
}

export interface MinMax {
  min: number;
  max: number;
}
export interface ConfigOption {
  name: string;
  type: string;
  items?: ConfigChildItem[];
}

export interface ConfigChildItem {
  name: string;
  recommended?: boolean;
  "default"?: string;
}
