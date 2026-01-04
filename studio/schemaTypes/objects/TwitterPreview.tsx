import { Tweet } from "react-tweet";
import type { PreviewProps } from "sanity";

export function TwitterPreview(props: PreviewProps & { tweetId: string }) {
	const { tweetId, renderDefault } = props || {};

	if (!tweetId) {
		return (
			<div>
				{renderDefault({ ...props, title: "Twitter Embed" })}
				Tweet-ID mangler
			</div>
		);
	}

	return (
		<div>
			{renderDefault({ ...props, title: "Twitter Embed" })}
			<Tweet id={tweetId} />
		</div>
	);
}
