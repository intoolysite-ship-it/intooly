'use client';

import { Settings, Gauge, Maximize2, Clock } from 'lucide-react';
import { FPS_PRESETS, SIZE_PRESETS, GIF_CONFIG } from '@/lib/video-to-gif/constants';
import type { GifSettings as GifSettingsType } from '@/lib/video-to-gif/types';

interface GifSettingsProps {
  settings: GifSettingsType;
  onChange: (settings: GifSettingsType) => void;
  videoDuration?: number;
  disabled?: boolean;
}

export default function GifSettings({
  settings,
  onChange,
  videoDuration = 0,
  disabled = false,
}: GifSettingsProps) {
  
  const updateSetting = <K extends keyof GifSettingsType>(
    key: K,
    value: GifSettingsType[K]
  ) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="settings-panel">
      <div className="settings-title">
        <Settings className="w-5 h-5" />
        إعدادات GIF
      </div>

      {/* FPS */}
      <div className="settings-group">
        <div className="settings-label">
          <Gauge className="w-4 h-4" />
          معدل الإطارات (FPS)
          <span className="label-count">{settings.fps}</span>
        </div>
        <div className="flex flex-wrap gap-2 mb-2">
          {FPS_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => updateSetting('fps', preset.value)}
              disabled={disabled}
              className={`preset-btn ${settings.fps === preset.value ? 'active' : ''}`}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <input
          type="range"
          min={GIF_CONFIG.MIN_FPS}
          max={GIF_CONFIG.MAX_FPS}
          value={settings.fps}
          onChange={(e) => updateSetting('fps', parseInt(e.target.value))}
          disabled={disabled}
          className="brand-slider"
        />
      </div>

      {/* الأبعاد */}
      <div className="settings-group">
        <div className="settings-label">
          <Maximize2 className="w-4 h-4" />
          العرض (بكسل)
          <span className="label-count">{settings.width}px</span>
        </div>
        <div className="flex flex-wrap gap-2 mb-2">
          {SIZE_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => updateSetting('width', preset.value)}
              disabled={disabled}
              className={`preset-btn ${settings.width === preset.value ? 'active' : ''}`}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <input
          type="range"
          min={GIF_CONFIG.MIN_WIDTH}
          max={GIF_CONFIG.MAX_WIDTH}
          step={20}
          value={settings.width}
          onChange={(e) => updateSetting('width', parseInt(e.target.value))}
          disabled={disabled}
          className="brand-slider"
        />
      </div>

      {/* وقت البداية والنهاية */}
      {videoDuration > 0 && (
        <div className="settings-group">
          <div className="settings-label">
            <Clock className="w-4 h-4" />
            القص الزمني
            <span className="label-count">
              {settings.startTime.toFixed(1)}s → {settings.endTime.toFixed(1)}s
            </span>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-ink-600 block mb-1">
                وقت البداية
              </label>
              <input
                type="range"
                min={0}
                max={Math.max(0, videoDuration - 0.5)}
                step={0.1}
                value={settings.startTime}
                onChange={(e) => {
                  const newStart = parseFloat(e.target.value);
                  updateSetting('startTime', newStart);
                  if (newStart >= settings.endTime) {
                    updateSetting('endTime', Math.min(videoDuration, newStart + 1));
                  }
                }}
                disabled={disabled}
                className="brand-slider"
              />
            </div>
            
            <div>
              <label className="text-xs font-bold text-ink-600 block mb-1">
                وقت النهاية
              </label>
              <input
                type="range"
                min={settings.startTime + 0.5}
                max={Math.min(videoDuration, settings.startTime + GIF_CONFIG.MAX_DURATION)}
                step={0.1}
                value={settings.endTime}
                onChange={(e) => updateSetting('endTime', parseFloat(e.target.value))}
                disabled={disabled}
                className="brand-slider"
              />
            </div>

            <p className="text-xs text-ink-500 font-bold">
              💡 المدة: {(settings.endTime - settings.startTime).toFixed(1)} ثانية
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
