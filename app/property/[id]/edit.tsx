import React from "react";
import { useLocalSearchParams } from "expo-router";
import { PostScreen } from "../../(tabs)/post";

export default function EditPropertyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id) {
    return null;
  }

  return <PostScreen mode="edit" propertyId={id} />;
}
