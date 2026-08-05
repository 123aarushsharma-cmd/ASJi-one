import React from "react";

export interface SEOHeadProps {
  title?: string;
  description?: string;
  ogImage?: string;
  robots?: string;
  canonicalUrl?: string;
}

export function SEOHead({
  title = "ASJi One — GDPR & DPDP Compliance Scanner",
  description = "Analyse any website or infrastructure text for GDPR, India DPDP and global compliance risk. Instant 0-100 score, critical leaks and fine exposure.",
  ogImage = "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/9442eb3f-6fad-409d-a461-d85cbe2d3c59",
  robots = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  canonicalUrl,
}: SEOHeadProps) {
  return (
    <>
      {/* Standard Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      <meta name="robots" content={robots} />
      <meta name="author" content="ASJi Law & Legal Engineering" />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="ASJi One" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content="ASJi One Compliance & Security Audit Platform" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </>
  );
}
