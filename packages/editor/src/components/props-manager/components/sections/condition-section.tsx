"use client";

import React from "react";
import {
  FormSection,
  FormField,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Input,
  Button,
} from "@senlo/ui";
import { Controller, useWatch } from "react-hook-form";
import { STANDARD_MERGE_TAGS } from "@senlo/core";
import { Trash2, Plus } from "lucide-react";
import { useEditorStore } from "../../../../state/editor.store";

interface ConditionSectionProps {
  control: any;
  setValue: any;
}

export const ConditionSection = ({
  control,
  setValue,
}: ConditionSectionProps) => {
  const customMergeTags = useEditorStore((s) => s.customMergeTags);
  const condition = useWatch({ control, name: "condition" });

  const handleAddCondition = () => {
    setValue("condition", {
      variable: "contact.email",
      operator: "equals",
      value: "",
    });
  };

  const handleRemoveCondition = () => {
    setValue("condition", undefined);
  };

  if (!condition) {
    return (
      <FormSection title="Conditional Content">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleAddCondition}
        >
          <Plus size={16} className="mr-2" />
          Add Display Condition
        </Button>
      </FormSection>
    );
  }

  return (
    <FormSection
      title="Conditional Content"
      headerAction={
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemoveCondition}
          className="h-10 w-10 p-0 text-destructive hover:bg-destructive/10"
        >
          <Trash2 size={24} />
        </Button>
      }
    >
      <FormField label="Variable">
        <Controller
          name="condition.variable"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select variable" />
              </SelectTrigger>
              <SelectContent>
                <div className="px-2 py-1.5 text-xs font-semibold text-zinc-500 uppercase">
                  Standard
                </div>
                {STANDARD_MERGE_TAGS.map((tag) => (
                  <SelectItem
                    key={tag.value}
                    value={tag.value.replace(/[{}]/g, "")}
                  >
                    {tag.label.toLowerCase()}
                  </SelectItem>
                ))}

                {customMergeTags.length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-xs font-semibold text-zinc-500 uppercase mt-2 border-t pt-2">
                      Custom (from trigger)
                    </div>
                    {customMergeTags.map((tag) => (
                      <SelectItem
                        key={tag.value}
                        value={tag.value.replace(/[{}]/g, "")}
                      >
                        {tag.label.toLowerCase()}
                      </SelectItem>
                    ))}
                  </>
                )}

                <div className="border-t mt-2 pt-2" />
                <SelectItem value="custom">custom variable path...</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </FormField>

      {condition.variable === "custom" && (
        <FormField label="Custom Variable Path">
          <Controller
            name="condition.variable_custom"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="e.g. contact.meta.plan"
                onChange={(e) => {
                  field.onChange(e);
                  setValue("condition.variable", e.target.value);
                }}
              />
            )}
          />
        </FormField>
      )}

      <FormField label="Operator">
        <Controller
          name="condition.operator"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select operator" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="equals">Equals</SelectItem>
                <SelectItem value="not_equals">Not Equals</SelectItem>
                <SelectItem value="gt">Greater Than</SelectItem>
                <SelectItem value="lt">Less Than</SelectItem>
                <SelectItem value="is_set">Is Set</SelectItem>
                <SelectItem value="is_not_set">Is Not Set</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </FormField>

      {condition.operator !== "is_set" &&
        condition.operator !== "is_not_set" && (
          <FormField label="Value">
            <Controller
              name="condition.value"
              control={control}
              render={({ field }) => (
                <Input
                  value={String(field.value ?? "")}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder="Value to compare"
                />
              )}
            />
          </FormField>
        )}
    </FormSection>
  );
};
