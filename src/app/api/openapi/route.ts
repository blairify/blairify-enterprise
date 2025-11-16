import { blairifyOpenApiDocument } from "@/lib/openapi";

export async function GET(): Promise<Response> {
  return Response.json(blairifyOpenApiDocument, {
    status: 200,
  });
}
