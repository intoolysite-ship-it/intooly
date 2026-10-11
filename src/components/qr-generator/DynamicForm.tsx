'use client';

import { useState } from 'react';
import { 
  Link as LinkIcon, Type, Mail, Phone, MessageSquare,
  Wifi, User, MessageCircle, MapPin, Calendar,
  Utensils, ShoppingBag, Building2, Settings,
  Eye, EyeOff, Info
} from 'lucide-react';
import type { QRData, QRType } from '@/lib/qr-generator/types';

// ============================================
// Props
// ============================================

interface DynamicFormProps {
  type: QRType;
  data: QRData;
  onChange: (data: QRData) => void;
  disabled?: boolean;
}

// ============================================
// Helper Components
// ============================================

interface FieldProps {
  label: string;
  icon?: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  hint?: string;
  disabled?: boolean;
  maxLength?: number;
}

function Field({
  label,
  icon,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  hint,
  disabled = false,
  maxLength,
}: FieldProps) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-extrabold text-ink-700 mb-1.5">
        {icon}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        dir="auto"
        className="w-full px-3 py-2.5 rounded-lg border-2 border-ink-200 bg-white text-sm font-medium text-ink-900 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all disabled:opacity-50"
      />
      {hint && (
        <p className="text-[10px] text-ink-500 font-bold mt-1 flex items-start gap-1">
          <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
          {hint}
        </p>
      )}
    </div>
  );
}

interface TextareaProps {
  label: string;
  icon?: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  hint?: string;
  disabled?: boolean;
  maxLength?: number;
  required?: boolean;
}

function Textarea({
  label,
  icon,
  value,
  onChange,
  placeholder,
  rows = 3,
  hint,
  disabled = false,
  maxLength,
}: TextareaProps) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-extrabold text-ink-700 mb-1.5">
        {icon}
        {label}
      </label>
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        maxLength={maxLength}
        dir="auto"
        className="w-full px-3 py-2.5 rounded-lg border-2 border-ink-200 bg-white text-sm font-medium text-ink-900 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all resize-none disabled:opacity-50"
      />
      {hint && (
        <p className="text-[10px] text-ink-500 font-bold mt-1 flex items-start gap-1">
          <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
          {hint}
        </p>
      )}
    </div>
  );
}

// ============================================
// نماذج أنواع QR
// ============================================

function LinkForm({ data, onChange, disabled }: DynamicFormProps) {
  const update = (key: string, value: string) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <div className="space-y-3">
      <Field
        label="الرابط"
        icon={<LinkIcon className="w-3.5 h-3.5" />}
        value={data.url || ''}
        onChange={(v) => update('url', v)}
        placeholder="https://example.com"
        type="url"
        required
        hint="يجب أن يبدأ بـ http:// أو https://"
        disabled={disabled}
      />
      <Field
        label="عنوان (اختياري)"
        value={data.title || ''}
        onChange={(v) => update('title', v)}
        placeholder="اسم الموقع أو الصفحة"
        disabled={disabled}
      />
      <Field
        label="وصف (اختياري)"
        value={data.description || ''}
        onChange={(v) => update('description', v)}
        placeholder="وصف مختصر"
        disabled={disabled}
      />
    </div>
  );
}

function TextForm({ data, onChange, disabled }: DynamicFormProps) {
  return (
    <div className="space-y-3">
      <Textarea
        label="النص"
        icon={<Type className="w-3.5 h-3.5" />}
        value={data.text || ''}
        onChange={(v) => onChange({ ...data, text: v })}
        placeholder="اكتب النص هنا..."
        rows={5}
        disabled={disabled}
        maxLength={2000}
      />
    </div>
  );
}

function EmailForm({ data, onChange, disabled }: DynamicFormProps) {
  const update = (key: string, value: string) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <div className="space-y-3">
      <Field
        label="البريد الإلكتروني"
        icon={<Mail className="w-3.5 h-3.5" />}
        value={data.email || ''}
        onChange={(v) => update('email', v)}
        placeholder="name@example.com"
        type="email"
        required
        disabled={disabled}
      />
      <Field
        label="الموضوع (اختياري)"
        value={data.subject || ''}
        onChange={(v) => update('subject', v)}
        placeholder="موضوع الرسالة"
        disabled={disabled}
      />
      <Textarea
        label="نص الرسالة (اختياري)"
        value={data.body || ''}
        onChange={(v) => update('body', v)}
        placeholder="محتوى الرسالة..."
        rows={3}
        disabled={disabled}
      />
    </div>
  );
}

function PhoneForm({ data, onChange, disabled }: DynamicFormProps) {
  return (
    <div className="space-y-3">
      <Field
        label="رقم الهاتف"
        icon={<Phone className="w-3.5 h-3.5" />}
        value={data.phone || ''}
        onChange={(v) => onChange({ ...data, phone: v })}
        placeholder="+966501234567"
        type="tel"
        required
        hint="أدخل الرقم مع رمز الدولة (مثل: +966)"
        disabled={disabled}
      />
    </div>
  );
}

function SmsForm({ data, onChange, disabled }: DynamicFormProps) {
  const update = (key: string, value: string) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <div className="space-y-3">
      <Field
        label="رقم الهاتف"
        icon={<MessageSquare className="w-3.5 h-3.5" />}
        value={data.phone || ''}
        onChange={(v) => update('phone', v)}
        placeholder="+966501234567"
        type="tel"
        required
        disabled={disabled}
      />
      <Textarea
        label="نص الرسالة"
        value={data.message || ''}
        onChange={(v) => update('message', v)}
        placeholder="نص الرسالة النصية..."
        rows={3}
        disabled={disabled}
        maxLength={160}
        hint="الحد الأقصى: 160 حرف"
      />
    </div>
  );
}

// ============================================
// نماذج متقدمة
// ============================================

function WifiForm({ data, onChange, disabled }: DynamicFormProps) {
  const update = (key: string, value: string) => {
    onChange({ ...data, [key]: value });
  };
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-3">
      <Field
        label="اسم الشبكة (SSID)"
        icon={<Wifi className="w-3.5 h-3.5" />}
        value={data.ssid || ''}
        onChange={(v) => update('ssid', v)}
        placeholder="MyWiFi"
        required
        disabled={disabled}
      />
      
      <div>
        <label className="flex items-center gap-1.5 text-xs font-extrabold text-ink-700 mb-1.5">
          كلمة المرور
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={data.password || ''}
            onChange={(e) => update('password', e.target.value)}
            placeholder="••••••••"
            disabled={disabled}
            className="w-full px-3 py-2.5 pl-10 rounded-lg border-2 border-ink-200 bg-white text-sm font-medium text-ink-900 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-700"
            disabled={disabled}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-[10px] text-red-600 font-bold mt-1 flex items-start gap-1">
          <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
          كلمة المرور ستكون مشفّرة داخل الرمز — شاركه مع من تثق به فقط
        </p>
      </div>

      <div>
        <label className="flex items-center gap-1.5 text-xs font-extrabold text-ink-700 mb-1.5">
          نوع التشفير
        </label>
        <select
          value={data.encryption || 'WPA'}
          onChange={(e) => update('encryption', e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2.5 rounded-lg border-2 border-ink-200 bg-white text-sm font-bold text-ink-900 focus:outline-none focus:border-brand-400 disabled:opacity-50"
        >
          <option value="WPA">WPA / WPA2 / WPA3</option>
          <option value="WEP">WEP (قديم)</option>
          <option value="nopass">بدون كلمة مرور</option>
        </select>
      </div>

      <label className="flex items-center gap-2 p-3 rounded-lg bg-ink-50 cursor-pointer">
        <input
          type="checkbox"
          checked={data.hidden === 'true'}
          onChange={(e) => update('hidden', e.target.checked ? 'true' : 'false')}
          disabled={disabled}
          className="w-4 h-4 accent-brand-500"
        />
        <span className="text-xs font-bold text-ink-700">
          شبكة مخفية
        </span>
      </label>
    </div>
  );
}

function VCardForm({ data, onChange, disabled }: DynamicFormProps) {
  const update = (key: string, value: string) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field
          label="الاسم الأول"
          icon={<User className="w-3.5 h-3.5" />}
          value={data.firstName || ''}
          onChange={(v) => update('firstName', v)}
          placeholder="محمد"
          required
          disabled={disabled}
        />
        <Field
          label="اسم العائلة"
          value={data.lastName || ''}
          onChange={(v) => update('lastName', v)}
          placeholder="الأحمد"
          disabled={disabled}
        />
      </div>
      
      <Field
        label="الهاتف"
        icon={<Phone className="w-3.5 h-3.5" />}
        value={data.phone || ''}
        onChange={(v) => update('phone', v)}
        placeholder="+966501234567"
        type="tel"
        disabled={disabled}
      />
      
      <Field
        label="البريد الإلكتروني"
        icon={<Mail className="w-3.5 h-3.5" />}
        value={data.email || ''}
        onChange={(v) => update('email', v)}
        placeholder="name@example.com"
        type="email"
        disabled={disabled}
      />
      
      <Field
        label="الشركة"
        value={data.company || ''}
        onChange={(v) => update('company', v)}
        placeholder="اسم الشركة"
        disabled={disabled}
      />
      
      <Field
        label="المسمى الوظيفي"
        value={data.jobTitle || ''}
        onChange={(v) => update('jobTitle', v)}
        placeholder="مدير تسويق"
        disabled={disabled}
      />
      
      <Field
        label="الموقع الإلكتروني"
        value={data.website || ''}
        onChange={(v) => update('website', v)}
        placeholder="https://example.com"
        type="url"
        disabled={disabled}
      />
      
      <Field
        label="العنوان"
        icon={<MapPin className="w-3.5 h-3.5" />}
        value={data.address || ''}
        onChange={(v) => update('address', v)}
        placeholder="الرياض، السعودية"
        disabled={disabled}
      />
    </div>
  );
}

function WhatsAppForm({ data, onChange, disabled }: DynamicFormProps) {
  const update = (key: string, value: string) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <div className="space-y-3">
      <Field
        label="رقم واتساب"
        icon={<MessageCircle className="w-3.5 h-3.5" />}
        value={data.whatsapp || ''}
        onChange={(v) => update('whatsapp', v)}
        placeholder="+966501234567"
        type="tel"
        required
        hint="أدخل الرقم مع رمز الدولة بدون + أو 00"
        disabled={disabled}
      />
      
      <Textarea
        label="رسالة جاهزة (اختياري)"
        value={data.message || ''}
        onChange={(v) => update('message', v)}
        placeholder="مرحباً، أريد الاستفسار عن..."
        rows={3}
        hint="ستظهر هذه الرسالة تلقائياً عند فتح المحادثة"
        disabled={disabled}
      />
    </div>
  );
}

function LocationForm({ data, onChange, disabled }: DynamicFormProps) {
  return (
    <div className="space-y-3">
      <Field
        label="رابط الموقع على الخريطة"
        icon={<MapPin className="w-3.5 h-3.5" />}
        value={data.location || ''}
        onChange={(v) => onChange({ ...data, location: v })}
        placeholder="https://maps.google.com/?q=24.7136,46.6753"
        type="url"
        required
        hint="انسخ رابط الموقع من Google Maps"
        disabled={disabled}
      />
    </div>
  );
}

function EventForm({ data, onChange, disabled }: DynamicFormProps) {
  const update = (key: string, value: string) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <div className="space-y-3">
      <Field
        label="اسم الفعالية"
        icon={<Calendar className="w-3.5 h-3.5" />}
        value={data.name || ''}
        onChange={(v) => update('name', v)}
        placeholder="مؤتمر التكنولوجيا 2026"
        required
        disabled={disabled}
      />
      
      <Textarea
        label="الوصف (اختياري)"
        value={data.description || ''}
        onChange={(v) => update('description', v)}
        placeholder="وصف الفعالية..."
        rows={2}
        disabled={disabled}
      />
      
      <div className="grid grid-cols-2 gap-3">
        <Field
          label="التاريخ"
          value={data.date || ''}
          onChange={(v) => update('date', v)}
          type="date"
          disabled={disabled}
        />
        <Field
          label="الوقت"
          value={data.time || ''}
          onChange={(v) => update('time', v)}
          type="time"
          disabled={disabled}
        />
      </div>
      
      <Field
        label="الموقع"
        icon={<MapPin className="w-3.5 h-3.5" />}
        value={data.location || ''}
        onChange={(v) => update('location', v)}
        placeholder="فندق الرياض، قاعة الكبرى"
        disabled={disabled}
      />
      
      <Field
        label="رابط التسجيل (اختياري)"
        value={data.registrationUrl || ''}
        onChange={(v) => update('registrationUrl', v)}
        placeholder="https://example.com/register"
        type="url"
        disabled={disabled}
      />
    </div>
  );
}

// ============================================
// نماذج تجارية
// ============================================

function RestaurantForm({ data, onChange, disabled }: DynamicFormProps) {
  const update = (key: string, value: string) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <div className="space-y-3">
      <Field
        label="اسم المطعم"
        icon={<Utensils className="w-3.5 h-3.5" />}
        value={data.name || ''}
        onChange={(v) => update('name', v)}
        placeholder="مطعم الأصالة"
        required
        disabled={disabled}
      />
      
      <Textarea
        label="الوصف (اختياري)"
        value={data.description || ''}
        onChange={(v) => update('description', v)}
        placeholder="أشهى الأطباق الشرقية..."
        rows={2}
        disabled={disabled}
      />
      
      <div className="grid grid-cols-2 gap-3">
        <Field
          label="الهاتف"
          icon={<Phone className="w-3.5 h-3.5" />}
          value={data.phone || ''}
          onChange={(v) => update('phone', v)}
          placeholder="+966501234567"
          type="tel"
          disabled={disabled}
        />
        <Field
          label="واتساب"
          icon={<MessageCircle className="w-3.5 h-3.5" />}
          value={data.whatsapp || ''}
          onChange={(v) => update('whatsapp', v)}
          placeholder="+966501234567"
          type="tel"
          disabled={disabled}
        />
      </div>
      
      <Field
        label="رابط قائمة الطعام"
        icon={<LinkIcon className="w-3.5 h-3.5" />}
        value={data.menuUrl || ''}
        onChange={(v) => update('menuUrl', v)}
        placeholder="https://example.com/menu"
        type="url"
        disabled={disabled}
      />
      
      <Field
        label="رابط الموقع على الخريطة"
        icon={<MapPin className="w-3.5 h-3.5" />}
        value={data.location || ''}
        onChange={(v) => update('location', v)}
        placeholder="https://maps.google.com/?q=..."
        type="url"
        disabled={disabled}
      />
      
      <Field
        label="ساعات العمل"
        value={data.hours || ''}
        onChange={(v) => update('hours', v)}
        placeholder="12:00 م - 12:00 ص"
        disabled={disabled}
      />
    </div>
  );
}

function StoreForm({ data, onChange, disabled }: DynamicFormProps) {
  const update = (key: string, value: string) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <div className="space-y-3">
      <Field
        label="اسم المتجر"
        icon={<ShoppingBag className="w-3.5 h-3.5" />}
        value={data.name || ''}
        onChange={(v) => update('name', v)}
        placeholder="متجر الإلكترونيات"
        required
        disabled={disabled}
      />
      
      <Textarea
        label="الوصف (اختياري)"
        value={data.description || ''}
        onChange={(v) => update('description', v)}
        placeholder="أفضل المنتجات بأفضل الأسعار..."
        rows={2}
        disabled={disabled}
      />
      
      <div className="grid grid-cols-2 gap-3">
        <Field
          label="الهاتف"
          icon={<Phone className="w-3.5 h-3.5" />}
          value={data.phone || ''}
          onChange={(v) => update('phone', v)}
          placeholder="+966501234567"
          type="tel"
          disabled={disabled}
        />
        <Field
          label="واتساب"
          icon={<MessageCircle className="w-3.5 h-3.5" />}
          value={data.whatsapp || ''}
          onChange={(v) => update('whatsapp', v)}
          placeholder="+966501234567"
          type="tel"
          disabled={disabled}
        />
      </div>
      
      <Field
        label="رابط الموقع الإلكتروني"
        icon={<LinkIcon className="w-3.5 h-3.5" />}
        value={data.website || ''}
        onChange={(v) => update('website', v)}
        placeholder="https://example.com"
        type="url"
        disabled={disabled}
      />
      
      <Field
        label="رابط الكتالوج"
        value={data.catalogUrl || ''}
        onChange={(v) => update('catalogUrl', v)}
        placeholder="https://example.com/catalog"
        type="url"
        disabled={disabled}
      />
      
      <Field
        label="رابط الموقع على الخريطة"
        icon={<MapPin className="w-3.5 h-3.5" />}
        value={data.location || ''}
        onChange={(v) => update('location', v)}
        placeholder="https://maps.google.com/?q=..."
        type="url"
        disabled={disabled}
      />
    </div>
  );
}

function CompanyForm({ data, onChange, disabled }: DynamicFormProps) {
  const update = (key: string, value: string) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <div className="space-y-3">
      <Field
        label="اسم الشركة"
        icon={<Building2 className="w-3.5 h-3.5" />}
        value={data.name || ''}
        onChange={(v) => update('name', v)}
        placeholder="شركة التقنية المتقدمة"
        required
        disabled={disabled}
      />
      
      <Textarea
        label="الوصف (اختياري)"
        value={data.description || ''}
        onChange={(v) => update('description', v)}
        placeholder="وصف مختصر للشركة..."
        rows={2}
        disabled={disabled}
      />
      
      <div className="grid grid-cols-2 gap-3">
        <Field
          label="الهاتف"
          icon={<Phone className="w-3.5 h-3.5" />}
          value={data.phone || ''}
          onChange={(v) => update('phone', v)}
          placeholder="+966501234567"
          type="tel"
          disabled={disabled}
        />
        <Field
          label="البريد"
          icon={<Mail className="w-3.5 h-3.5" />}
          value={data.email || ''}
          onChange={(v) => update('email', v)}
          placeholder="info@example.com"
          type="email"
          disabled={disabled}
        />
      </div>
      
      <Field
        label="رابط الموقع"
        icon={<LinkIcon className="w-3.5 h-3.5" />}
        value={data.website || ''}
        onChange={(v) => update('website', v)}
        placeholder="https://example.com"
        type="url"
        disabled={disabled}
      />
      
      <Field
        label="العنوان"
        icon={<MapPin className="w-3.5 h-3.5" />}
        value={data.address || ''}
        onChange={(v) => update('address', v)}
        placeholder="الرياض، حي العليا، شارع..."
        disabled={disabled}
      />
      
      <Field
        label="رابط الموقع على الخريطة"
        value={data.location || ''}
        onChange={(v) => update('location', v)}
        placeholder="https://maps.google.com/?q=..."
        type="url"
        disabled={disabled}
      />
    </div>
  );
}

function CustomForm({ data, onChange, disabled }: DynamicFormProps) {
  const update = (key: string, value: string) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <div className="space-y-3">
      <Textarea
        label="البيانات"
        icon={<Settings className="w-3.5 h-3.5" />}
        value={data.data || ''}
        onChange={(v) => update('data', v)}
        placeholder="أدخل أي بيانات (نص، JSON، رابط، إلخ)"
        rows={5}
        required
        disabled={disabled}
      />
      
      <Field
        label="عنوان (اختياري)"
        value={data.title || ''}
        onChange={(v) => update('title', v)}
        placeholder="عنوان وصفي"
        disabled={disabled}
      />
    </div>
  );
}

// ============================================
// DynamicForm — الدالة الرئيسية
// ============================================

export default function DynamicForm({
  type,
  data,
  onChange,
  disabled = false,
}: DynamicFormProps) {
  const renderForm = () => {
    const props = { type, data, onChange, disabled };

    switch (type) {
      case 'link':
        return <LinkForm {...props} />;
      case 'text':
        return <TextForm {...props} />;
      case 'email':
        return <EmailForm {...props} />;
      case 'phone':
        return <PhoneForm {...props} />;
      case 'sms':
        return <SmsForm {...props} />;
      case 'wifi':
        return <WifiForm {...props} />;
      case 'vcard':
        return <VCardForm {...props} />;
      case 'whatsapp':
        return <WhatsAppForm {...props} />;
      case 'location':
        return <LocationForm {...props} />;
      case 'event':
        return <EventForm {...props} />;
      case 'restaurant':
        return <RestaurantForm {...props} />;
      case 'store':
        return <StoreForm {...props} />;
      case 'company':
        return <CompanyForm {...props} />;
      case 'custom':
        return <CustomForm {...props} />;
      default:
        return <LinkForm {...props} />;
    }
  };

  return (
    <div className="bg-white border-2 border-ink-200 rounded-2xl p-4 md:p-6">
      <div className="mb-4">
        <h3 className="font-extrabold text-ink-900 text-base md:text-lg flex items-center gap-2">
          📝 البيانات
        </h3>
        <p className="text-xs md:text-sm text-ink-500 font-bold mt-1">
          أدخل بيانات QR
        </p>
      </div>

      {renderForm()}
    </div>
  );
}


