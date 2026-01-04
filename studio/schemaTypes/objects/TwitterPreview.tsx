'use client'

import type {PreviewProps} from 'sanity'
import {useEffect, useState, type ComponentType} from 'react'

export function TwitterPreview(props: PreviewProps & {tweetId: string}) {
  const {tweetId, renderDefault} = props || {}
  const [TweetComponent, setTweetComponent] = useState<ComponentType<{id: string}> | null>(null)

  useEffect(() => {
    // Dynamically import react-tweet only in the browser
    if (typeof window !== 'undefined') {
      import('react-tweet')
        .then((module) => {
          setTweetComponent(() => module.Tweet)
        })
        .catch((err) => {
          console.error('Failed to load react-tweet:', err)
        })
    }
  }, [])

  if (!tweetId) {
    return (
      <div>
        {renderDefault({...props, title: 'Twitter Embed'})}
        Tweet-ID mangler
      </div>
    )
  }

  return (
    <div>
      {renderDefault({...props, title: 'Twitter Embed'})}
      {TweetComponent ? <TweetComponent id={tweetId} /> : <div>Loading tweet...</div>}
    </div>
  )
}
