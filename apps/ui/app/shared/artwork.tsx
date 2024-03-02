'use client'

export type ArtworkProps = {
  id: string
} & React.ImgHTMLAttributes<HTMLImageElement>

export default function Artwork({ id, ...attributes }: ArtworkProps) {
  const mergedAttributes = {
    ...attributes,
    src: `/artworks/${id}-MOCK.png`,
    alt: id,
  }

  return <img {...mergedAttributes} />
}
