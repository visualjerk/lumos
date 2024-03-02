'use client'

import { useState } from 'react'

export type ArtworkProps = {
  id: string
} & React.ImgHTMLAttributes<HTMLImageElement>

export default function Artwork({ id, ...attributes }: ArtworkProps) {
  const [imgId, setImgId] = useState<string>(id)

  function handleOnError(e: React.SyntheticEvent<HTMLImageElement>) {
    e.stopPropagation()
    setImgId('not-found')
  }

  const mergedAttributes = {
    ...attributes,
    src: `/artworks/${imgId}-MOCK.png`,
    alt: id,
  }

  return <img {...mergedAttributes} onError={handleOnError} />
}
