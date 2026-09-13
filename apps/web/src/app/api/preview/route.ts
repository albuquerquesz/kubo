import { generate, type VirtualNode } from "@kubojs/template-generator";
import { EMBEDDED_TEMPLATES } from "@kubojs/template-generator";
import { NextResponse } from "next/server";

import { sanitizeStackState } from "@/lib/sanitize-stack-addons";
import { stackStateToProjectConfig } from "@/lib/stack-state";

export async function POST(request: Request) {
  try {
    const body = sanitizeStackState(await request.json());
    const config = stackStateToProjectConfig(body);

    const result = await generate({
      config,
      templates: EMBEDDED_TEMPLATES,
    });

    if (result.isErr()) {
      throw new Error(result.error.message);
    }

    const tree = result.value;
    const transformedRoot = transformTree(tree.root);

    return NextResponse.json({
      success: true,
      tree: {
        root: transformedRoot,
        fileCount: tree.fileCount,
        directoryCount: tree.directoryCount,
      },
    });
  } catch (error) {
    console.error("Preview generation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

function transformTree(node: VirtualNode): Record<string, unknown> {
  if (node.type === "file") {
    return {
      name: node.name,
      path: node.path,
      type: "file" as const,
      content: node.content,
      extension: node.extension,
    };
  }

  return {
    name: node.name,
    path: node.path,
    type: "directory" as const,
    children: node.children.map(transformTree),
  };
}
