import { Box, Card, Flex } from "@sanity/ui";
import React from "react";
import { set } from "sanity";
import { ICONS } from "./icons";

import { BookIcon, HouseIcon, NewsIcon, PencilIcon } from "@/components/icons";

const iconMap: Record<string, React.ReactNode> = {
  BookIcon: <BookIcon width={3} height={3} />,
  HouseIcon: <HouseIcon width={3} height={3} />,
  NewsIcon: <NewsIcon width={3} height={3} />,
  PencilIcon: <PencilIcon width={3} height={3} />,
};

export default function IconRadioInput(props: any) {
  const { value, onChange } = props;

  return (
    <Flex direction="row" gap={3}>
      {ICONS.map((icon) => (
        <Card
          key={icon.value}
          padding={2}
          radius={2}
          width={8}
          shadow={value === icon.value ? 2 : 1}
          tone={value === icon.value ? "primary" : "default"}
          style={{
            cursor: "pointer",
            border:
              value === icon.value ? "2px solid #2563eb" : "1px solid #e5e7eb",
            boxSizing: "border-box",
            transition: "border 0.15s",
          }}
          onClick={() => onChange(set(icon.value))}
        >
          <Flex direction="row" align="center" justify="center">
            <Box aria-description={icon?.title ?? ""} width={16}>
              {iconMap[icon.value]}
            </Box>
          </Flex>
        </Card>
      ))}
    </Flex>
  );
}
