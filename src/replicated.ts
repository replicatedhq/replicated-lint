// These are very WIP

export interface ReplicatedApp {
  config: ConfigSection[];
  components: Component[];
}

export interface ConfigSection {
  items: ConfigOption[];
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

// adminCommand
/*
type AdminCommand struct {
    // AdminCommandV2 api version >= 2.6.0
    AdminCommandV2 `yaml:",inline"`
    // AdminCommandV1 api version < 2.6.0
    AdminCommandV1 `yaml:",inline"`
}
type AdminCommandV2 struct {
    Alias   string                   `yaml:"alias" json:"alias" validate:"required,shellalias"`
    Command []string                 `yaml:"command,flow" json:"command" validate:"required"`
    Timeout uint                     `yaml:"timeout,omitempty" json:"timeout,omitempty"`
    RunType AdminCommandRunType      `yaml:"run_type,omitempty" json:"run_type,omitempty"` // default "exec"
    When    string                   `yaml:"when,omitempty" json:"when,omitempty"`
    Source  SchedulerContainerSource `yaml:"source" json:"source" validate:"required"`
}
type AdminCommandRunType string
type AdminCommandV1 struct { // deprecated
    Component string        `yaml:"component,omitempty" json:"component,omitempty" validate:"omitempty,componentexists"`
    Image     *CommandImage `yaml:"image,omitempty" json:"image,omitempty" validate:"omitempty,dive"`
}
type CommandImage struct {
    Name    string `yaml:"image_name" json:"image_name" validate:"required"`
    Version string `yaml:"version" json:"version"`
}
*/
export interface AdminCommand {
  /**
   * AdminCommandV2 api version >= 2.6.0
   */
  AdminCommandV2?: AdminCommandV2;

  /**
   * AdminCommandV1 api version < 2.6.0
   */
  AdminCommandV1?: AdminCommandV1;
}

export interface AdminCommandV2 {
  /**
   *
   */
  alias: string;

  /**
   *
   */
  command: string[];

  /**
   * @minimum 0
   * @TJS-type integer
   */
  timeout?: number;

  /**
   *
   */
  run_type?: AdminCommandRunType;

  /**
   *
   */
  when?: string;

  /**
   *
   */
  source: SchedulerContainerSource;
}

export type AdminCommandRunType = string;

export interface AdminCommandV1 {
  /**
   *
   */
  component?: string;

  /**
   *
   */
  image?: CommandImage;
}

export interface CommandImage {
  /**
   *
   */
  image_name: string;

  /**
   *
   */
  version?: string;
}

// schedulerSource
/*
type SchedulerContainerSource struct {
    SourceContainerNative *SourceContainerNative `yaml:"replicated,omitempty" json:"replicated,omitempty" validate:"omitempty,dive"`
    SourceContainerSwarm  *SourceContainerSwarm  `yaml:"swarm,omitempty" json:"swarm,omitempty" validate:"omitempty,dive"`
    SourceContainerK8s    *SourceContainerK8s    `yaml:"kubernetes,omitempty" json:"kubernetes,omitempty" validate:"omitempty,dive"`
}
type SourceContainerNative struct {
    Component string `yaml:"component" json:"component" validate:"required,componentexists"`
    Container string `yaml:"container" json:"container" validate:"containerexists=Component"`
}
type SourceContainerSwarm struct {
    Service string `yaml:"service" json:"container" validate:"required"`
}
type SourceContainerK8s struct {
    Selector  map[string]string `yaml:"selector" json:"selector" validate:"required,dive,required"`
    Selectors map[string]string `yaml:"selectors" json:"selectors"` // deprecated
    Container string            `yaml:"container,omitempty" json:"container,omitempty"`
}
*/
export interface SchedulerContainerSource {
  /**
   *
   */
  replicated?: SourceContainerNative;

  /**
   *
   */
  swarm?: SourceContainerSwarm;

  /**
   *
   */
  kubernetes?: SourceContainerK8s;
}

export interface SourceContainerNative {
  /**
   *
   */
  component: string;

  /**
   *
   */
  container?: string;
}

export interface SourceContainerSwarm {
  /**
   *
   */
  service: string;
}

/**
 *
 */
export interface SourceContainerK8s {
  /**
   * @TJS-type: object
   */
  selector: { [key: string]: string };

  /**
   *
   */
  container?: string;
}

// airgap
/*
type Image struct {
    Source       string        `yaml:"source,omitempty" json:"source,omitempty" validate:"externalregistryexists"` // default public
    Name         string        `yaml:"name" json:"name" validate:"required"`
    Tag          string        `yaml:"tag,omitempty" json:"tag,omitempty"` // default latest
    ContentTrust *ContentTrust `yaml:"content_trust,omitempty" json:"content_trust,omitempty"`
}
*/
export interface Image {
  /**
   *
   */
  source?: string;

  /**
   *
   */
  name: string;

  /**
   *
   */
  tag?: string;

  /**
   *
   */
  content_trust?: ContentTrust;
}

// contentTrust
/*
type ContentTrust struct {
    PublicKeyFingerprint string `yaml:"public_key_fingerprint" json:"public_key_fingerprint" validate:"fingerprint"`
}
*/
export interface ContentTrust {
  /**
   *
   */
  public_key_fingerprint: string;
}

// backup
/*
type Backup struct {
	Enabled         string `yaml:"enabled" json:"enabled"`
	Hidden          string `yaml:"hidden" json:"hidden"`
	PauseAll        bool   `yaml:"pause_all" json:"pause_all"` // deprecated
	PauseContainers string `yaml:"pause_containers" json:"pause_containers"`
	Script          string `yaml:"script" json:"script"`
}
*/
export interface Backup {
  /**
   *
   */
  enabled?: string;

  /**
   *
   */
  hidden?: string;

  /**
   *
   */
  pause_containers?: string;

  /**
   *
   */
  script?: string;
}

// component
/*
type Component struct {
	Name             string                    `yaml:"name" json:"name" validate:"required"`
	Tags             []string                  `yaml:"tags,omitempty" json:"tags,omitempty"`
	Conflicts        []string                  `yaml:"conflicts,omitempty" json:"conflicts,omitempty"`
	Cluster          BoolString                `yaml:"cluster" json:"cluster"`
	ClusterHostCount ComponentClusterHostCount `yaml:"cluster_host_count,omitempty" json:"cluster_host_count,omitempty"`
	HostRequirements HostRequirements          `yaml:"host_requirements,omitempty" json:"host_requirements,omitempty"`
	LogOptions       LogOptions                `yaml:"logs" json:"logs"`
	HostVolumes      []*HostVolume             `yaml:"host_volumes,omitempty" json:"host_volumes,omitempty"`
	Containers       []*Container              `yaml:"containers" json:"containers" validate:"dive,exists"` // validate:"min=1"
}
type BoolString string
type ComponentClusterHostCount struct {
	// Strategy = "autoscale" api version >= 2.7.0
	// Strategy = "random" api version >= 2.5.0
	Strategy          string     `yaml:"strategy,omitempty" json:"strategy,omitempty" validate:"omitempty,clusterstrategy"`
	Min               UintString `yaml:"min" json:"min" validate:"omitempty,uint"`
	Max               UintString `yaml:"max,omitempty" json:"max,omitempty" validate:"omitempty,uint"` // 0 == unlimited
	ThresholdHealthy  UintString `yaml:"threshold_healthy,omitempty" json:"threshold_healthy,omitempty" validate:"omitempty,uint"`
	ThresholdDegraded UintString `yaml:"threshold_degraded,omitempty" json:"threshold_degraded,omitempty" validate:"omitempty,uint"` // 0 == no degraded state
}
type UintString string
*/
export interface Component {
  /**
   *
   */
  name: string;

  /**
   *
   */
  tags?: string[];

  /**
   *
   */
  conflicts?: string[];

  /**
   *
   */
  cluster?: BoolString;

  /**
   *
   */
  cluster_host_count?: ComponentClusterHostCount;

  /**
   *
   */
  host_requirements?: HostRequirements;

  /**
   *
   */
  logs?: LogOptions;

  /**
   *
   */
  host_volumes?: HostVolume[];

  /**
   *
   */
  containers?: Container[];
}

export type BoolString = string;

export interface ComponentClusterHostCount {
  /**
   * Strategy
   *  - "autoscale" api version >= 2.7.0
   *  - "random" api version >= 2.5.0
   */
  strategy?: string;

  /**
   *
   */
  min?: UintString;

  /**
   *
   */
  max?: UintString;

  /**
   *
   */
  threshold_healthy?: UintString;

  /**
   *
   */
  threshold_degraded?: UintString;
}

export type UintString = string;

// hostRequirements
/*
type HostRequirements struct {
	ReplicatedVersion string `yaml:"replicated_version,omitempty" json:"replicated_version,omitempty" validate:"omitempty,semverrange"`
	DockerVersion     string `yaml:"docker_version,omitempty" json:"docker_version,omitempty" validate:"omitempty,dockerversion"`
	CPUCores          uint   `yaml:"cpu_cores,omitempty" json:"cpu_cores,omitempty"`
	CPUMhz            uint   `yaml:"cpu_mhz,omitempty" json:"cpu_mhz,omitempty"`
	Memory            string `yaml:"memory,omitempty" json:"memory,omitempty" validate:"omitempty,bytes"`
	DiskSpace         string `yaml:"disk_space,omitempty" json:"disk_space,omitempty" validate:"omitempty,bytes"`
}
*/
export interface HostRequirements {
  /**
   *
   */
  replicated_version?: string;

  /**
   *
   */
  docker_version?: string;

  /**
   *
   */
  cpu_cores?: string;

  /**
   *
   */
  cpu_mhz?: string;

  /**
   *
   */
  memory?: string;

  /**
   *
   */
  disk_space?: string;
}

// log_requirements
/*
type LogOptions struct {
	MaxSize  string `yaml:"max_size" json:"max_size"`
	MaxFiles string `yaml:"max_files" json:"max_files"`
}
*/
export interface LogOptions {
  /**
   *
   */
  max_size?: string;

  /**
   *
   */
  max_files?: string;
}

// volume
/*
type HostVolume struct {
	HostPath             string `yaml:"host_path" json:"host_path" validate:"required,absolutepath"`
	Owner                string `yaml:"owner" json:"owner"`                                     // not yet supported
	Permission           string `yaml:"permission" json:"permission"`                           // not yet supported
	IsEphemeral          string `yaml:"is_ephemeral" json:"is_ephemeral"`                       // not yet supported
	IsExcludedFromBackup string `yaml:"is_excluded_from_backup" json:"is_excluded_from_backup"` // not yet supported
	MinDiskSpace         string `yaml:"min_disk_space" json:"min_disk_space"`
}
type ContainerVolume struct {
	HostPath             string   `yaml:"host_path" json:"host_path" validate:"required"`
	ContainerPath        string   `yaml:"container_path" json:"container_path" validate:"required,absolutepath"`
	Options              []string `yaml:"options" json:"options" validate:"volumeoptions"`
	Permission           string   `yaml:"permission" json:"permission"`                           // deprecate
	Owner                string   `yaml:"owner" json:"owner"`                                     // deprecate
	IsEphemeral          string   `yaml:"is_ephemeral" json:"is_ephemeral"`                       // deprecate
	IsExcludedFromBackup string   `yaml:"is_excluded_from_backup" json:"is_excluded_from_backup"` // deprecate
}
*/
export interface HostVolume {
  /**
   *
   */
  host_path: string;

  /**
   *
   */
  owner?: string;

  /**
   *
   */
  permission?: string;

  /**
   *
   */
  is_ephemeral?: string;

  /**
   *
   */
  is_excluded_from_backup?: string;

  /**
   *
   */
  min_disk_space?: string;
}

export interface ContainerVolume {
  /**
   *
   */
  host_path: string;

  /**
   *
   */
  container_path: string;

  /**
   *
   */
  options?: string[];

  /**
   *
   */
  permission?: string;

  /**
   *
   */
  owner?: string;

  /**
   *
   */
  is_ephemeral?: string;

  /**
   *
   */
  is_excluded_from_backup?: string;
}

// container
/*
type Container struct {
	Source               string                        `yaml:"source" json:"source" validate:"required,externalregistryexists"`
	ImageName            string                        `yaml:"image_name" json:"image_name" validate:"required"`
	Version              string                        `yaml:"version" json:"version" validate:"required"`
	DisplayName          string                        `yaml:"display_name" json:"display_name"`
	Name                 string                        `yaml:"name" json:"name" validate:"containernameunique,clusterinstancefalse"`
	Privileged           bool                          `yaml:"privileged" json:"privileged"`
	NetworkMode          string                        `yaml:"network_mode" json:"network_mode"`
	CPUShares            string                        `yaml:"cpu_shares" json:"cpu_shares"`
	MemoryLimit          string                        `yaml:"memory_limit" json:"memory_limit"`
	MemorySwapLimit      string                        `yaml:"memory_swap_limit" json:"memory_swap_limit"`
	ULimits              []ULimit                      `yaml:"ulimits,omitempty" json:"ulimits,omitempty"`
	AllocateTTY          string                        `yaml:"allocate_tty" json:"allocate_tty"`
	SecurityCapAdd       []string                      `yaml:"security_cap_add" json:"security_cap_add"`
	SecurityOptions      []string                      `yaml:"security_options" json:"security_options"`
	Hostname             string                        `yaml:"hostname" json:"hostname"`
	Cmd                  string                        `yaml:"cmd" json:"cmd"`
	Entrypoint           *[]string                     `yaml:"entrypoint" json:"entrypoint"`
	Ephemeral            bool                          `yaml:"ephemeral" json:"ephemeral"`
	SuppressRestart      []string                      `yaml:"suppress_restart" json:"suppress_restart"`
	Cluster              BoolString                    `yaml:"cluster" json:"cluster" validate:"omitempty,bool"`
	Restart              *ContainerRestartPolicy       `yaml:"restart" json:"restart"`
	ClusterInstanceCount ContainerClusterInstanceCount `yaml:"cluster_instance_count" json:"cluster_instance_count"`
	PublishEvents        []*ContainerEvent             `yaml:"publish_events" json:"publish_events" validate:"dive,exists"`
	SubscribedEvents     []map[string]interface{}      `yaml:"-" json:"-"`
	ConfigFiles          []*ContainerConfigFile        `yaml:"config_files" json:"config_files" validate:"dive,exists"`
	CustomerFiles        []*ContainerCustomerFile      `yaml:"customer_files" json:"customer_files" validate:"dive,exists"`
	EnvVars              []*ContainerEnvVar            `yaml:"env_vars" json:"env_vars" validate:"dive,exists"`
	Ports                []*ContainerPort              `yaml:"ports,omitempty" json:"ports,omitempty" validate:"dive,exists"`
	LogOptions           LogOptions                    `yaml:"logs" json:"logs"`
	Volumes              []*ContainerVolume            `yaml:"volumes" json:"volumes" validate:"dive,exists"`
	VolumesFrom          []string                      `yaml:"volumes_from" json:"volumes_from" validate:"dive,required,containernameexists,requiressubscription"`
	ExtraHosts           []*ContainerExtraHost         `yaml:"extra_hosts" json:"hosts" validate:"dive,exists"`
	SupportFiles         []*ContainerSupportFile       `yaml:"support_files" json:"support_files" validate:"dive,exists"`
	SupportCommands      []*ContainerSupportCommand    `yaml:"support_commands" json:"support_commands" validate:"dive,exists"`
	ContentTrust         ContentTrust                  `yaml:"content_trust" json:"content_trust"`
	When                 string                        `yaml:"when" json:"when"`
	Dynamic              string                        `yaml:"dynamic" json:"dynamic"`
	PidMode              string                        `yaml:"pid_mode" json:"pid_mode"`
}
type ContainerRestartPolicy struct {
	Policy string `yaml:"policy" json:"policy"`
	Max    uint   `yaml:"max" json:"max"`
}
type ContainerClusterInstanceCount struct {
	Initial           UintString `yaml:"initial" json:"initial" validate:"omitempty,uint"`
	Max               UintString `yaml:"max,omitempty" json:"max" validate:"omitempty,uint"` // 0 == unlimited
	ThresholdHealthy  UintString `yaml:"threshold_healthy,omitempty" json:"threshold_healthy,omitempty" validate:"omitempty,uint"`
	ThresholdDegraded UintString `yaml:"threshold_degraded,omitempty" json:"threshold_degraded" validate:"omitempty,uint"` // 0 == no degraded state
}
type ULimit struct {
	Name string `yaml:"name" json:"name" validate:"required"`
	Soft string `yaml:"soft,omitempty" json:"soft,omitempty"`
	Hard string `yaml:"hard,omitempty" json:"hard,omitempty"`
}
*/
export interface Container {
  /**
   *
   */
  source: string;

  /**
   *
   */
  image_name: string;

  /**
   *
   */
  version: string;

  /**
   *
   */
  display_name?: string;

  /**
   *
   */
  name: string;

  /**
   *
   */
  privileged: boolean;
}
