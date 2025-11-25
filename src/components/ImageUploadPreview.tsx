import React, { useEffect, useState } from "react";

export default function ImageUploadPreview({ file }: { file: File | null }) {
const [src, setSrc] = useState<string | null>(null);

useEffect(() => {
if (!file) return setSrc(null);
const reader = new FileReader();
reader.onload = () => setSrc(reader.result as string);
reader.readAsDataURL(file);
return () => reader.abort();
}, [file]);


if (!src) return null;


return (
<img
src={src}
alt="preview"
className="h-28 w-28 rounded-xl object-cover ring-1 ring-gray-200 dark:ring-gray-700"
/>
);
}