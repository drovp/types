# @drovp/types

This package contains type definitions for Drovp plugin API (https://github.com/drovp/drovp).

## Installation

```
npm install --save-dev @drovp/types@*
```

## Documentation

The documentation is at [drovp.app/docs/typing](https://drovp.app/docs/typing).

## Quick example

Types are intended to be imported in:

### `main.ts` (plugin)

```ts
import {App, PayloadData, makeOptionsSchema, makeAcceptsFlags} from '@drovp/types';

type Options = {
	bulkItems: boolean;
	allowFiles: boolean;
	fileTypes: string[];
};

const schema = makeOptionsSchema<Options>()([
	{name: 'bulkItems', type: 'boolean'},
	{name: 'allowFiles', type: 'boolean'},
	{
		name: 'fileTypes',
		type: 'select',
		default: [],
		options: ['jpg', 'png', 'gif'],
		isHidden: (value, options) => options.allowFiles,
	},
]);
const accepts = makeAcceptsFlags<Options>()({
	files: (item, options) => options.allowFiles && options.fileTypes.includes(item.type),
});

export type Payload = PayloadData<Options, typeof config>;

// Omit if no dependencies
export interface Dependencies {
	ffmpeg: string;
}

export default (app: App) => {
	app.registerProcessor<Payload>('foo', {
		main: 'dist/processor.js',
		dependencies: ['@drovp/ffmpeg:ffmpeg'],
		accepts: accepts,
		options: schema,
		bulkItems: (items, options) => options.bulkItems,
	});
};
```

### `processor.ts`

```ts
import type {ProcessorUtils} from '@drovp/types';
import type {Payload, Dependencies} from './';

export default async (payload: Payload, utils: ProcessorUtils<Dependencies>) => {
	console.log(payload); // ItemFile(s), profile options, and extra data if any
	console.log(utils.dependencies.ffmpeg); // path to ffmpeg binary
};
```
