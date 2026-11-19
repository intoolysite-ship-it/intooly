"use client";

import { useState } from "react";
import {
  Calculator,
  Users,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  Info,
} from "lucide-react";
import {
  calculateInheritance,
  formatShare,
  type InheritanceResult,
} from "../lib/engine";
import type { InheritanceInput } from "../lib/types";
import { EMPTY_HEIRS } from "../lib/types";

const initialInput: InheritanceInput = {
  deceasedGender: "male",
  estateAmount: 100000,
  funeralExpenses: 0,
  debts: 0,
  bequest: 0,
  heirs: { ...EMPTY_HEIRS },
  otherHeirsPresent: false,
};

const heirNames: Record<string, string> = {
  husband: "الزوج",
  wife: "الزوجة",
  father: "الأب",
  mother: "الأم",
  son: "الابن",
  daughter: "البنت",
};

function NumberField({
  label,
  value,
  onChange,
  min = 0,
  step = 1,
  hint,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  step?: number;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
      <input
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(event) => onChange(Math.max(0, Number(event.target.value) || 0))}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
      />
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

function CountField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <NumberField
      label={label}
      value={value}
      min={0}
      step={1}
      onChange={(next) => onChange(Math.floor(next))}
    />
  );
}

export default function InheritanceCalculator() {
  const [input, setInput] = useState<InheritanceInput>({
    ...initialInput,
    heirs: { ...EMPTY_HEIRS },
  });
  const [result, setResult] = useState<InheritanceResult | null>(null);
  const [attempted, setAttempted] = useState(false);

  const update = (changes: Partial<InheritanceInput>) => {
    setInput((current) => ({ ...current, ...changes }));
    setResult(null);
  };

  const updateHeirs = (
    changes: Partial<InheritanceInput["heirs"]>,
  ) => {
    setInput((current) => ({
      ...current,
      heirs: { ...current.heirs, ...changes },
    }));
    setResult(null);
  };

  const handleCalculate = () => {
    setAttempted(true);
    setResult(calculateInheritance(input));
  };

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat("ar-EG", {
      maximumFractionDigits: 2,
    }).format(amount);

  const hasSpouse =
    input.deceasedGender === "male"
      ? input.heirs.wives > 0
      : input.heirs.husband > 0;

  return (
    <div dir="rtl" className="space-y-8 text-right">
      <section className="rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-amber-50 p-5 shadow-sm sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
            <Calculator size={25} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
              احسب تقسيم التركة
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              أدخل بيانات التركة والورثة للحصول على الأنصبة ضمن الحالات المدعومة.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-6 flex items-center gap-3">
          <Wallet className="text-orange-600" size={23} />
          <h3 className="text-lg font-extrabold text-slate-900">بيانات التركة</h3>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <NumberField
            label="إجمالي التركة"
            value={input.estateAmount}
            step={0.01}
            onChange={(estateAmount) => update({ estateAmount })}
          />
          <NumberField
            label="مصاريف التجهيز"
            value={input.funeralExpenses}
            step={0.01}
            onChange={(funeralExpenses) => update({ funeralExpenses })}
          />
          <NumberField
            label="الديون المستحقة"
            value={input.debts}
            step={0.01}
            onChange={(debts) => update({ debts })}
          />
          <NumberField
            label="الوصية"
            value={input.bequest}
            step={0.01}
            onChange={(bequest) => update({ bequest })}
            hint="تُراجع الوصية إذا تجاوزت ثلث المتبقي بعد التجهيز والديون."
          />
        </div>

        <div className="mt-5 rounded-xl bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-semibold text-slate-600">صافي التركة التقديري بعد الخصومات</span>
            <strong className="text-lg text-slate-900">
              {formatMoney(
                input.estateAmount -
                  input.funeralExpenses -
                  input.debts -
                  input.bequest,
              )}
            </strong>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-6 flex items-center gap-3">
          <Users className="text-orange-600" size={23} />
          <h3 className="text-lg font-extrabold text-slate-900">بيانات المتوفى والورثة</h3>
        </div>

        <div className="mb-6">
          <span className="mb-3 block text-sm font-bold text-slate-700">جنس المتوفى</span>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                update({
                  deceasedGender: "male",
                  heirs: { ...input.heirs, husband: 0 },
                });
              }}
              className={`rounded-xl border px-4 py-3 font-bold transition ${
                input.deceasedGender === "male"
                  ? "border-orange-400 bg-orange-50 text-orange-700"
                  : "border-slate-200 text-slate-600 hover:border-orange-200"
              }`}
            >
              ذكر
            </button>
            <button
              type="button"
              onClick={() => {
                update({
                  deceasedGender: "female",
                  heirs: { ...input.heirs, wives: 0 },
                });
              }}
              className={`rounded-xl border px-4 py-3 font-bold transition ${
                input.deceasedGender === "female"
                  ? "border-orange-400 bg-orange-50 text-orange-700"
                  : "border-slate-200 text-slate-600 hover:border-orange-200"
              }`}
            >
              أنثى
            </button>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {input.deceasedGender === "male" ? (
            <CountField
              label="عدد الزوجات"
              value={input.heirs.wives}
              onChange={(wives) => updateHeirs({ wives })}
            />
          ) : (
            <CountField
              label="عدد الأزواج"
              value={input.heirs.husband}
              onChange={(husband) => updateHeirs({ husband })}
            />
          )}

          <CountField
            label="عدد الأبناء الذكور"
            value={input.heirs.sons}
            onChange={(sons) => updateHeirs({ sons })}
          />
          <CountField
            label="عدد البنات"
            value={input.heirs.daughters}
            onChange={(daughters) => updateHeirs({ daughters })}
          />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-orange-300">
            <input
              type="checkbox"
              checked={input.heirs.father}
              onChange={(event) => updateHeirs({ father: event.target.checked })}
              className="h-5 w-5 accent-orange-600"
            />
            <span className="font-semibold text-slate-800">الأب على قيد الحياة</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-orange-300">
            <input
              type="checkbox"
              checked={input.heirs.mother}
              onChange={(event) => updateHeirs({ mother: event.target.checked })}
              className="h-5 w-5 accent-orange-600"
            />
            <span className="font-semibold text-slate-800">الأم على قيد الحياة</span>
          </label>
        </div>

        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={input.otherHeirsPresent}
              onChange={(event) => update({ otherHeirsPresent: event.target.checked })}
              className="mt-1 h-5 w-5 accent-orange-600"
            />
            <span>
              <span className="block font-bold text-amber-900">
                يوجد ورثة آخرون غير المذكورين
              </span>
              <span className="mt-1 block text-sm leading-6 text-amber-800">
                مثل الجد أو الجدة أو الإخوة أو غيرهم. عند تحديد هذا الخيار لن تصدر الحاسبة توزيعاً نهائياً.
              </span>
            </span>
          </label>
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-start gap-2 text-sm leading-7 text-slate-600">
            <Info className="mt-1 shrink-0 text-orange-600" size={18} />
            <p>
              أدخل جميع الورثة الموجودين وقت الوفاة. لا تعتبر عدم إدخال وارث آخر تأكيداً لصحة المسألة إلا بعد التحقق من جميع المستحقين.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCalculate}
          className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-4 text-base font-extrabold text-white shadow-md shadow-orange-200 transition hover:bg-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-200"
        >
          <Calculator size={20} />
          احسب أنصبة الورثة
        </button>
      </section>

      {attempted && result && (
        <section
          aria-live="polite"
          className="space-y-5"
        >
          {result.success ? (
            <>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <div className="flex items-center gap-2 text-emerald-800">
                  <CheckCircle2 size={22} />
                  <h3 className="text-lg font-extrabold">نتيجة الحساب</h3>
                </div>
                <p className="mt-2 text-sm leading-7 text-emerald-800">
                  هذه نتيجة حسابية للحالة المدخلة ضمن نطاق المسائل المدعومة، وتحتاج إلى مراجعة مختص قبل اعتمادها.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <span className="text-sm text-slate-500">صافي التركة</span>
                  <strong className="mt-2 block text-xl text-slate-900">{formatMoney(result.netEstate)}</strong>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <span className="text-sm text-slate-500">إجمالي الموزع</span>
                  <strong className="mt-2 block text-xl text-slate-900">{formatMoney(result.totalDistributed)}</strong>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <span className="text-sm text-slate-500">المتبقي</span>
                  <strong className="mt-2 block text-xl text-slate-900">{formatMoney(result.remaining)}</strong>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 bg-slate-50 p-5">
                  <h3 className="font-extrabold text-slate-900">تفصيل نصيب كل وارث</h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {result.allocations.map((allocation, index) => (
                    <div key={`${allocation.type}-${index}`} className="p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h4 className="font-extrabold text-slate-900">
                          {heirNames[allocation.type]}
                          {allocation.count > 1 && ` (${allocation.count})`}
                        </h4>
                        <span className="rounded-full bg-orange-50 px-3 py-1 text-sm font-bold text-orange-700">
                          {formatShare(allocation.totalShare)}
                        </span>
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div>
                          <span className="text-xs text-slate-500">نصيب الفرد</span>
                          <strong className="mt-1 block text-slate-900">
                            {formatShare(allocation.sharePerPerson)}
                          </strong>
                        </div>
                        <div>
                          <span className="text-xs text-slate-500">مبلغ الفرد</span>
                          <strong className="mt-1 block text-slate-900">
                            {formatMoney(allocation.amountPerPerson)}
                          </strong>
                        </div>
                        <div>
                          <span className="text-xs text-slate-500">إجمالي نصيب الفئة</span>
                          <strong className="mt-1 block text-slate-900">
                            {formatMoney(allocation.totalAmount)}
                          </strong>
                        </div>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{allocation.reason}</p>
                    </div>
                  ))}
                </div>
              </div>

              {result.notes.length > 0 && (
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <h4 className="font-bold text-blue-900">ملاحظات الحساب</h4>
                  {result.notes.map((note, index) => (
                    <p key={index} className="mt-2 text-sm leading-7 text-blue-800">{note}</p>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
              <div className="flex items-center gap-2 text-red-800">
                <AlertTriangle size={22} />
                <h3 className="text-lg font-extrabold">تعذر إصدار توزيع نهائي</h3>
              </div>
              <p className="mt-2 text-sm leading-7 text-red-800">
                لا يمكن اعتماد نتيجة لهذه المسألة ضمن نطاق الحاسبة الحالي.
              </p>
              <ul className="mt-3 list-inside list-disc space-y-2 text-sm leading-7 text-red-800">
                {result.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-1 shrink-0 text-amber-700" size={21} />
          <div>
            <h3 className="font-extrabold text-amber-900">تنبيه شرعي وقانوني مهم</h3>
            <p className="mt-2 text-sm leading-7 text-amber-900">
              هذه الحاسبة أداة مساعدة للحالات المحدودة التي يدعمها محركها الحالي، وليست فتوى شرعية أو مستنداً قانونياً. قد تتأثر القسمة بوجود ورثة آخرين أو وصايا أو ديون أو اختلافات فقهية وقانونية. يجب مراجعة عالم مختص أو جهة قضائية معتمدة قبل توزيع التركة فعلياً.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
