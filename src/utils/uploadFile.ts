import { uploadFileToS3 } from "@/actions/upload";

export const uploadFile = async ({
  file,
  folder,
  customFileName,
  type,
  alt,
  userId,
  metadata,
}: {
  file: File;
  folder: string;
  customFileName?: string;
  alt?: string;
  type?: string;
  userId: string;
  metadata?: {
    width: number;
    height: number;
    size: string;
    format: string;
  };
}) => {
  await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject("Base64 conversion failed");
  });
  const result = await uploadFileToS3({
    file,
    folder,
    customFileName,
  });
  console.log("result-->", result);
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/media`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      src: result.url,
      userId,
      type,
      alt: alt || result.originalFileName,
      name: result.originalFileName || alt,
      key: result.uploadedKey,
      result: { metadata },
    }),
  });
  const media = await response.json();
  return {
    media,
    result,
  };
};
