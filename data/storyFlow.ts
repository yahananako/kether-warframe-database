export type StorySource = {
  readonly label: string;
  readonly url: string;
};

export type StoryImage = {
  readonly src: string;
  readonly alt: string;
  readonly caption: string;
};

export type StoryScene = {
  readonly heading?: string;
  readonly paragraphs: readonly string[];
  readonly image?: StoryImage;
};

export type StoryMeaning = {
  readonly title: string;
  readonly text: string;
};

export type StoryPassage = {
  readonly id: string;
  readonly kicker: string;
  readonly title: string;
  readonly englishTitle: string;
  readonly period: string;
  readonly summary: string;
  readonly paragraphs: readonly string[];
  readonly scenes?: readonly StoryScene[];
  readonly prerequisites?: readonly string[];
  readonly rewards?: readonly string[];
  readonly timeline?: readonly string[];
  readonly characters: readonly string[];
  readonly image?: StoryImage;
  readonly meaning: StoryMeaning;
};

export type StoryChapter = {
  readonly slug: string;
  readonly number: string;
  readonly label: string;
  readonly title: string;
  readonly englishTitle: string;
  readonly era: string;
  readonly deck: string;
  readonly readTime: string;
  readonly spoilerLevel: string;
  readonly heroImage: string;