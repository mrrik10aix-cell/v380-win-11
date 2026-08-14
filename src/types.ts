export type AppTab = 'devices' | 'events' | 'cloud' | 'album' | 'settings';

export type NightVisionMode = 'auto' | 'fullColor' | 'infrared' | 'smart';

export type StreamQuality = 'SD' | 'HD' | 'FHD' | '4K';

export type SceneType = 'living_room' | 'front_porch' | 'backyard' | 'office' | 'factory' | 'store';

export type AlarmType = 'motion_human' | 'motion_vehicle' | 'motion_pet' | 'abnormal_sound' | 'tamper';

export interface PresetPosition {
  id: string;
  name: string;
  pan: number;
  tilt: number;
}

export interface SharedUser {
  id: string;
  name: string;
  email: string;
  role: 'Viewer' | 'Admin' | 'Family';
  addedAt: string;
}

export interface Device {
  id: string;
  name: string;
  model: string;
  status: 'online' | 'offline' | 'connecting';
  isRecording: boolean;
  isMuted: boolean;
  isTalkbackActive: boolean;
  isMotionTrackingEnabled: boolean;
  isLightOn: boolean;
  isSirenOn: boolean;
  isNightVision: boolean;
  nightVisionMode: NightVisionMode;
  quality: StreamQuality;
  fps: number;
  bitrate: string;
  batteryPercent?: number;
  signalStrength: number; // 1-100
  pingMs?: number; // network latency in ms (e.g. 18ms)
  isPrivacyMode?: boolean; // Lens turned off & mic muted while registered
  ambientLux?: number; // Ambient light sensor reading in Lux (0-100 Lux)
  appBrand?: 'ICSee' | 'ICSee_Pro' | 'V380_Pro' | 'XMEye' | 'Imou_Life' | 'Google_Home';
  protocol?: 'NETIP_ICSee' | 'V380_SDK' | 'ONVIF' | 'RTSP' | 'Tuya' | 'Imou_SDK' | 'Dahua_P2P';
  googleHome?: {
    linked: boolean;
    googleDeviceId?: string;
    castTarget?: string;
    voiceCommandsEnabled: boolean;
    deviceType: 'camera' | 'doorbell' | 'floodlight';
  };
  icseeSettings?: {
    netipPort: number;
    rtspPort: number;
    dualLensMode?: boolean;
    humanoidTracking: boolean;
    cordonAlarm: boolean;
    cloudProvider?: 'Google_Drive' | 'OneDrive' | 'Google_Cloud' | 'None';
  };
  imouSettings?: {
    imouDeviceId: string;
    smartTracking: boolean;
    petDetection: boolean;
    activeDeterrenceStrobe: boolean;
    alarmSoundProfile: '110dB_Siren' | 'Dog_Bark' | 'Custom_Voice' | 'Mute';
    privacyMasking: boolean;
  };
  storage: {
    cloudSyncActive: boolean;
    cloudProvider: 'Google_Drive' | 'OneDrive' | 'Google_Cloud' | 'None';
    lastSyncTime?: string;
    lastSuccessfulSyncTime?: string;
    pendingUploads?: number;
    syncHealth?: 'optimal' | 'syncing' | 'idle' | 'warning' | 'paused';
    uploadBandwidthKbps?: number;
    sdCardSizeGB: number;
    sdCardUsedGB: number;
  };
  presetPositions: PresetPosition[];
  pan: number; // 0 - 360
  tilt: number; // -90 to 90
  zoom: number; // 1 to 8
  detectionZoneGrid: boolean[][]; // 6x6 grid
  sharedWith: SharedUser[];
  sceneType: SceneType;
  lastAlarmTime?: string;
  ipAddress: string;
  macAddress: string;
  firmwareVersion: string;
}

export interface FaceProfile {
  id: string;
  name: string;
  role: 'family' | 'friend' | 'delivery' | 'frequent_visitor' | 'vip' | 'other';
  avatarUrl: string;
  registeredDate: string;
  taggedCount: number;
  confidenceScore: number; // e.g. 98.5%
  alertPriority: 'normal' | 'silent' | 'priority_push' | 'welcome_chime';
  associatedDeviceId?: string;
  notes?: string;
}

export interface AlarmEvent {
  id: string;
  deviceId: string;
  deviceName: string;
  type: AlarmType;
  timestamp: string;
  timeISO: string;
  snapshotUrl?: string;
  hasCloudVideo: boolean;
  cloudSyncedTo?: 'Google_Drive' | 'OneDrive' | 'Google_Cloud';
  aiTags: string[];
  aiAnalysis?: string;
  durationSec: number;
  read: boolean;
  recognizedFaceId?: string;
  recognizedFaceName?: string;
  recognizedFaceAvatar?: string;
  recognizedFaceRole?: string;
  isRecognizedPerson?: boolean;
}

export interface AlbumItem {
  id: string;
  deviceId: string;
  deviceName: string;
  type: 'photo' | 'video';
  url: string;
  timestamp: string;
  title: string;
  fileSizeMB: number;
  syncedToCloud?: 'Google_Drive' | 'OneDrive' | 'Google_Cloud';
}

export interface SavedGridLayout {
  id: string;
  name: string;
  gridMode: '4' | '9';
  order: string[]; // device ids in position order
  updatedAt: string;
}

export interface DiscoveredNetworkDevice {
  id: string;
  ip: string;
  mac: string;
  model: string;
  brand: 'ICSee_Pro' | 'ICSee' | 'V380_Pro' | 'Imou_Life' | 'XMEye';
  protocol: 'NETIP_ICSee' | 'V380_SDK' | 'Imou_SDK' | 'ONVIF';
  ports: {
    primary: number;
    rtsp: number;
    http?: number;
  };
  firmware: string;
  signalDbm: number;
  latencyMs: number;
  isBound: boolean;
  resolution: string;
  defaultName: string;
  suggestedScene: SceneType;
}

export interface CloudSyncSettings {
  googleDrive: {
    connected: boolean;
    accountEmail: string;
    targetFolder: string;
    autoUploadAlarms: boolean;
    quotaUsedGB: number;
    quotaTotalGB: number;
    lastSynced: string;
  };
  oneDrive: {
    connected: boolean;
    accountEmail: string;
    targetFolder: string;
    autoUploadAlarms: boolean;
    quotaUsedGB: number;
    quotaTotalGB: number;
    lastSynced: string;
  };
  activeDefaultProvider: 'google_drive' | 'onedrive';
  syncResolution: 'original' | 'fhd' | 'hd';
  wifiOnlySync: boolean;
}
