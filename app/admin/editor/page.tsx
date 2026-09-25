import type { Metadata } from "next";

import VisualEditorShell from "../../../components/VisualEditorShell";

export const metadata: Metadata = {
  title: "KETHER CONTROL",
  description: "KETHER 全站可視化管理後台",
  robots: {
    index: false,
    follow: false,
  },
};

export default function VisualEditorPage() {
  return <VisualEditorShell />;
}
