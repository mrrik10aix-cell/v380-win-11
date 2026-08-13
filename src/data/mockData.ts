import { Device, AlarmEvent, AlbumItem, CloudPlan, FaceProfile } from '../types';

// Empty initial default states (Demo data removed)
export const INITIAL_DEVICES: Device[] = [];
export const INITIAL_EVENTS: AlarmEvent[] = [];
export const INITIAL_ALBUM: AlbumItem[] = [];
export const INITIAL_FACE_LIBRARY: FaceProfile[] = [];

// Sample demo datasets retained for optional manual quick-testing
export const SAMPLE_DEMO_DEVICES: Device[] = [
  {
    id: 'dev-1',
    name: 'Living Room ICSee Dual-Lens',
    model: 'ICSee Pro Q9 Dual-Lens 4K PTZ',
    status: 'online',
    isRecording: true,
    isMuted: false,
    isTalkbackActive: false,
    isMotionTrackingEnabled: true,
    isLightOn: false,
    isSirenOn: false,
    isNightVision: false,
    nightVisionMode: 'smart',
    quality: '4K',
    fps: 30,
    bitrate: '2.4 MB/s',
    signalStrength: 95,
    pingMs: 14,
    ambientLux: 55,
    appBrand: 'ICSee_Pro',
    protocol: 'NETIP_ICSee',
    googleHome: {
      linked: true,
      googleDeviceId: 'gh-cam-livingroom-01',
      castTarget: 'Living Room Nest Hub Max',
      voiceCommandsEnabled: true,
      deviceType: 'camera',
    },
    icseeSettings: {
      netipPort: 34567,
      rtspPort: 554,
      dualLensMode: true,
      humanoidTracking: true,
      cordonAlarm: true,
      cloudProvider: 'ICSee_Cloud',
    },
    storage: {
      cloudActive: true,
      cloudExpiresDays: 28,
      sdCardSizeGB: 128,
      sdCardUsedGB: 42.5,
    },
    presetPositions: [
      { id: 'p1', name: 'Main Sofa', pan: 45, tilt: 10 },
      { id: 'p2', name: 'Front Entrance Door', pan: 180, tilt: -5 },
      { id: 'p3', name: 'Balcony Window', pan: 270, tilt: 20 },
    ],
    pan: 45,
    tilt: 10,
    zoom: 1,
    detectionZoneGrid: Array(6).fill(null).map(() => Array(6).fill(true)),
    sharedWith: [
      { id: 'u1', name: 'Sarah (Wife)', email: 'sarah@example.com', role: 'Family', addedAt: '2026-05-10' },
      { id: 'u2', name: 'David (Brother)', email: 'david@example.com', role: 'Viewer', addedAt: '2026-06-01' },
    ],
    sceneType: 'living_room',
    lastAlarmTime: '10 mins ago',
    ipAddress: '192.168.1.104',
    macAddress: 'C4:09:38:A2:1F:01',
    firmwareVersion: 'v5.03.R12.ICSEE',
  },
  {
    id: 'dev-2',
    name: 'Front Porch ICSee 4K Solar',
    model: 'ICSee Outdoor PTZ Speed Dome (NETIP)',
    status: 'online',
    isRecording: true,
    isMuted: false,
    isTalkbackActive: false,
    isMotionTrackingEnabled: true,
    isLightOn: false,
    isSirenOn: false,
    isNightVision: true,
    nightVisionMode: 'fullColor',
    quality: '4K',
    fps: 25,
    bitrate: '2.8 MB/s',
    batteryPercent: 88,
    signalStrength: 88,
    pingMs: 28,
    ambientLux: 12,
    appBrand: 'ICSee',
    protocol: 'NETIP_ICSee',
    googleHome: {
      linked: true,
      googleDeviceId: 'gh-cam-porch-02',
      castTarget: 'Front Hallway TV Chromecast',
      voiceCommandsEnabled: true,
      deviceType: 'floodlight',
    },
    icseeSettings: {
      netipPort: 34567,
      rtspPort: 554,
      dualLensMode: false,
      humanoidTracking: true,
      cordonAlarm: true,
      cloudProvider: 'ICSee_Cloud',
    },
    storage: {
      cloudActive: true,
      cloudExpiresDays: 14,
      sdCardSizeGB: 256,
      sdCardUsedGB: 110,
    },
    presetPositions: [
      { id: 'p4', name: 'Driveway Gate', pan: 90, tilt: -15 },
      { id: 'p5', name: 'Package Drop Zone', pan: 135, tilt: -25 },
      { id: 'p6', name: 'Sidewalk', pan: 210, tilt: 0 },
    ],
    pan: 135,
    tilt: -25,
    zoom: 1,
    detectionZoneGrid: [
      [false, false, true, true, false, false],
      [false, true, true, true, true, false],
      [true, true, true, true, true, true],
      [true, true, true, true, true, true],
      [false, true, true, true, true, false],
      [false, false, true, true, false, false],
    ],
    sharedWith: [
      { id: 'u1', name: 'Sarah (Wife)', email: 'sarah@example.com', role: 'Admin', addedAt: '2026-05-10' }
    ],
    sceneType: 'front_porch',
    lastAlarmTime: '2 hours ago',
    ipAddress: '192.168.1.108',
    macAddress: 'C4:09:38:B4:8E:92',
    firmwareVersion: 'v5.01.R08.XM',
  },
];

export const SAMPLE_DEMO_FACE_LIBRARY: FaceProfile[] = [
  {
    id: 'face-1',
    name: 'Sarah (Mom)',
    role: 'family',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    registeredDate: '2026-05-12',
    taggedCount: 12,
    confidenceScore: 98.5,
    notes: 'Homeowner / Primary Admin',
    alertPriority: 'normal',
  },
  {
    id: 'face-2',
    name: 'David (Dad)',
    role: 'family',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    registeredDate: '2026-05-14',
    taggedCount: 8,
    confidenceScore: 97.2,
    notes: 'Family member',
    alertPriority: 'normal',
  },
];

export const SAMPLE_DEMO_EVENTS: AlarmEvent[] = [
  {
    id: 'evt-101',
    deviceId: 'dev-1',
    deviceName: 'Living Room ICSee Dual-Lens',
    timestamp: '2026-08-02 10:42:18',
    timeISO: '2026-08-02T10:42:18Z',
    type: 'motion_human',
    hasCloudVideo: true,
    snapshotUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
    durationSec: 18,
    read: false,
    aiAnalysis: 'Person recognized as Sarah (Mom) entered the living room.',
    aiTags: ['Recognized Person', 'Sarah (Mom)', 'Living Room'],
    recognizedFaceName: 'Sarah (Mom)',
    recognizedFaceAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    recognizedFaceRole: 'family',
    isRecognizedPerson: true,
  },
];

export const SAMPLE_DEMO_ALBUM: AlbumItem[] = [
  {
    id: 'alb-1',
    deviceId: 'dev-1',
    deviceName: 'Living Room ICSee',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    timestamp: '2026-08-01 14:15:22',
    title: 'Snapshot_LivingRoom_01.jpg',
    fileSizeMB: 2.1,
  },
];

export const CLOUD_PLANS: CloudPlan[] = [
  {
    id: 'plan-7d',
    name: '7-Day Event Loop Cloud',
    price: '$2.99',
    period: '/month',
    description: 'Unlimited 7-day motion alert recording stored in encrypted cloud.',
    features: [
      '7 days rolling cloud storage',
      'AES-256 financial-grade encryption',
      'AI Human & Vehicle Smart Filter',
      'Instant mobile push alerts with video thumbnail',
      'Unlimited download & clip export'
    ],
  },
  {
    id: 'plan-30d',
    name: '30-Day Event Loop Cloud',
    price: '$6.99',
    period: '/month',
    recommended: true,
    description: 'Our most popular security plan with 30 days history and priority AI analysis.',
    features: [
      '30 days rolling cloud video storage',
      'Gemini AI Smart Security Insights & Summaries',
      'Multi-device account sync (up to 5 cameras)',
      'High-speed cloud video playback (up to 8x speed)',
      'VIP customer support & loss compensation guarantee'
    ],
  },
  {
    id: 'plan-24h-full',
    name: 'Continuous 24/7 Full Recording',
    price: '$12.99',
    period: '/month',
    description: 'Non-stop 24/7 continuous stream archiving on high-speed cloud servers.',
    features: [
      'Continuous 24-hour non-stop video recording',
      '15 days rolling archive',
      'Ultra HD 4K bitrate streaming optimization',
      'Automatic offline backup cache resume',
      'Shared cloud vault for family members'
    ],
  }
];
