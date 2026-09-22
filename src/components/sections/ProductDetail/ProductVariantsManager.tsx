/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import InputField from "@/components/ui/InputField";

type Option = { id?: string; name: string; values: string[] };
type VariantDraft = {
  id?: string;
  name: string;
  options: Record<string, string>;
  price: string;
  sku?: string;
  stockQuantity?: number;
  image?: string;
  isDefault?: boolean;
  compareAtPrice?: string;
  trackInventory?: boolean;
  lowStockThreshold?: number;
};

interface Props {
  productId?: string;
  initialOptions?: Option[];
  initialVariants?: VariantDraft[];
  onChange?: (payload: { variants: VariantDraft[]; options: Option[] }) => void;

  /** NEW: styling overrides */
  containerClass?: string;
  innerClass?: string;
  textClass?: string;
  inputBorderClass?: string;
}

function cartesianProduct(arrays: string[][]) {
  return arrays.reduce<string[][]>(
    (a, b) => a.flatMap((d) => b.map((e) => [...d, e])),
    [[]]
  );
}

export default function ProductVariantsManager({
  initialOptions = [],
  initialVariants = [],
  onChange,

  containerClass = "",
  innerClass = "",
  textClass = "",
  inputBorderClass = "",
}: Props) {
  const [options, setOptions] = useState<Option[]>(
    initialOptions.length > 0 ? initialOptions : [{ name: "Size", values: [] }]
  );
  const [variants, setVariants] = useState<VariantDraft[]>(initialVariants);
  const [newValues, setNewValues] = useState<{ [key: number]: string }>({});
  const [newOptionName, setNewOptionName] = useState<string>("");

  useEffect(() => {
    onChange?.({ variants, options });
  }, [variants, options]);

  const addOption = () => {
    const name = newOptionName.trim();
    setOptions((s) => [...s, { name: name || "", values: [] }]);
    setNewOptionName("");
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    generateVariants(newOptions);
  };

  const updateOptionName = (index: number, name: string) => {
    const cloned = [...options];
    const oldName = cloned[index].name;
    cloned[index].name = name;
    setOptions(cloned);

    if (oldName && oldName !== name) {
      setVariants((cur) =>
        cur.map((v) => {
          const newOpts = { ...v.options };
          if (oldName in newOpts) {
            newOpts[name] = newOpts[oldName];
            delete newOpts[oldName];
          }
          return { ...v, options: newOpts };
        })
      );
    }
  };

  const addOptionValue = (index: number) => {
    const val = (newValues[index] || "").trim();
    if (!val) return;
    const cloned = [...options];
    if (!cloned[index].values.includes(val)) {
      cloned[index].values.push(val);
      setOptions(cloned);
      setNewValues({ ...newValues, [index]: "" });
      generateVariants(cloned);
    }
  };

  const removeOptionValue = (optIndex: number, valIndex: number) => {
    const cloned = [...options];
    cloned[optIndex].values.splice(valIndex, 1);
    setOptions(cloned);
    generateVariants(cloned);
  };

  const generateVariants = (opts: Option[]) => {
    const validOpts = opts.filter((o) => o.name && o.values.length > 0);
    if (validOpts.length === 0) {
      setVariants([]);
      return;
    }

    const names = validOpts.map((o) => o.name);
    const lists = validOpts.map((o) => o.values);
    const combos = cartesianProduct(lists);

    const newVariants = combos.map((combo) => {
      const optObj: Record<string, string> = {};
      const nameParts: string[] = [];
      combo.forEach((val, i) => {
        optObj[names[i]] = val;
        nameParts.push(val);
      });
      const existing = variants.find(
        (v) => JSON.stringify(v.options) === JSON.stringify(optObj)
      );
      return (
        existing ??
        ({
          name: nameParts.join(" / "),
          sku: `SKU-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
          price: "0",
          compareAtPrice: "",
          stockQuantity: 0,
          options: optObj,
          isDefault: false,
          trackInventory: true,
          lowStockThreshold: 5,
        } as VariantDraft)
      );
    });

    if (!newVariants.some((v) => v.isDefault) && newVariants.length > 0)
      newVariants[0].isDefault = true;

    setVariants(newVariants);
  };

  const updateVariant = (
    index: number,
    field: keyof VariantDraft,
    value: any
  ) => {
    const cloned = [...variants];
    cloned[index] = { ...cloned[index], [field]: value };
    if (field === "isDefault" && value === true) {
      cloned.forEach((v, i) => {
        if (i !== index) v.isDefault = false;
      });
    }
    setVariants(cloned);
  };

  return (
    <div
      className={`space-y-6 border p-6 rounded-lg ${containerClass} ${textClass}`}
    >
      <div className="flex justify-between items-center">
        <h3 className={`text-lg font-semibold ${textClass}`}>
          Product Variants
        </h3>

        <div className="flex gap-2">
          <input
            placeholder="Option name (Color)"
            value={newOptionName}
            onChange={(e) => setNewOptionName(e.target.value)}
            className={`border px-2 py-1 bg-transparent ${inputBorderClass} ${textClass}`}
          />
          <Button type="button" onClick={addOption} className="h-fit">
            <Plus className={`w-4 h-4 ${textClass}`} />
          </Button>
        </div>
      </div>

      {options.map((opt, oi) => (
        <div
          key={oi}
          className={`border p-3 rounded ${innerClass} ${textClass}`}
        >
          <div className="flex gap-2 mb-2">
            <InputField
              value={opt.name}
              onChange={(e) => updateOptionName(oi, e.target.value)}
              placeholder="Option name (Size, Color)"
              className={`flex-1 bg-transparent ${inputBorderClass} ${textClass}`}
            />
            <Button type="button" onClick={() => removeOption(oi)}>
              <Trash2 className="w-4 h-4 text-red-600" />
            </Button>
          </div>

          <div className="flex gap-2 mb-2">
            <input
              className={`border p-2 flex-1 bg-transparent ${inputBorderClass} ${textClass}`}
              placeholder="Add value e.g. Small"
              value={newValues[oi] || ""}
              onChange={(e) =>
                setNewValues({ ...newValues, [oi]: e.target.value })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addOptionValue(oi);
                }
              }}
            />
            <Button type="button" onClick={() => addOptionValue(oi)}>
              <Plus className={`w-4 h-4 ${textClass}`} />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {opt.values.map((v, vi) => (
              <span
                key={vi}
                className={`inline-flex items-center gap-2 px-3 py-1 rounded border ${textClass}`}
              >
                {v}
                <button
                  onClick={() => removeOptionValue(oi, vi)}
                  className="opacity-70 hover:opacity-100"
                >
                  <X className={`w-3 h-3 ${textClass}`} />
                </button>
              </span>
            ))}
          </div>
        </div>
      ))}

      <div>
        <h4 className={`font-semibold mb-2 ${textClass}`}>
          Generated Variants ({variants.length})
        </h4>

        {variants.length === 0 ? (
          <div className={`text-sm opacity-70 ${textClass}`}>
            Add option values to generate variants
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {variants.map((v, i) => (
              <div
                key={i}
                className={`border p-3 rounded ${innerClass} ${textClass}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <input
                    type="checkbox"
                    checked={v.isDefault}
                    onChange={(e) =>
                      updateVariant(i, "isDefault", e.target.checked)
                    }
                  />
                  <div className="font-medium">{v.name}</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <InputField
                    label="SKU"
                    type="text"
                    value={v.sku}
                    onChange={(e) => updateVariant(i, "sku", e.target.value)}
                    className={`${inputBorderClass} ${textClass}`}
                  />
                  <InputField
                    label="Price"
                    type="number"
                    value={v.price}
                    onChange={(e) => updateVariant(i, "price", e.target.value)}
                    className={`${inputBorderClass} ${textClass}`}
                  />
                  <InputField
                    label="Compare at Price"
                    type="number"
                    value={v.compareAtPrice || ""}
                    onChange={(e) =>
                      updateVariant(i, "compareAtPrice", e.target.value)
                    }
                    className={`${inputBorderClass} ${textClass}`}
                  />
                  <InputField
                    label="Stock"
                    type="number"
                    value={String(v.stockQuantity ?? 0)}
                    onChange={(e) =>
                      updateVariant(
                        i,
                        "stockQuantity",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className={`${inputBorderClass} ${textClass}`}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}