"use client";

import { useBlockForm } from "../../../../hooks/use-block-form";
import { spacerSchema } from "../../../../schemas/block-schemas";
import { FormSection, Slider, PaddingControl } from "@senlo/ui";
import { SpacerBlock } from "@senlo/core";
import { Controller } from "react-hook-form";
import {
  DEFAULT_SPACER_HEIGHT,
  MIN_SPACER_HEIGHT,
  MAX_SPACER_HEIGHT,
  DEFAULT_SPACER_PADDING,
} from "./defaults/spacer";
import { ConditionSection } from "./condition-section";

interface SpacerSectionProps {
  block: SpacerBlock;
}

export const SpacerSection = ({ block }: SpacerSectionProps) => {
  const { control, setValue } = useBlockForm({
    block,
    schema: spacerSchema,
  });

  return (
    <FormSection title="Spacer Settings">
      <Controller
        name="height"
        control={control}
        render={({ field }) => (
          <Slider
            label="Height"
            unit="px"
            min={MIN_SPACER_HEIGHT}
            max={MAX_SPACER_HEIGHT}
            value={field.value ?? DEFAULT_SPACER_HEIGHT}
            onChange={field.onChange}
          />
        )}
      />

      <FormSection title="Spacing">
        <Controller
          name="padding"
          control={control}
          render={({ field }) => (
            <PaddingControl
              value={field.value ?? DEFAULT_SPACER_PADDING}
              onChange={field.onChange}
            />
          )}
        />
      </FormSection>

      <ConditionSection control={control} setValue={setValue} />
    </FormSection>
  );
};
