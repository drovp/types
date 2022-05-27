/**
 * CONSTRAINED IDENTITY FUNCTIONS.
 *
 * Allow defining interfaces without loosing intellisense and error reporting,
 * while keeping the interface identity intact.
 *
 * ```
 * // TS just takes `foo` for `Foo`, ignoring what's inside `something`
 * const foo: Foo = something;
 *
 * // TS examines `something` closely
 * const foo = makeSomething(something);
 *
 * // You keep the identity, but you loose intellisense and errors while
 * // defining `something`, because TS doesn't know what you're trying to define
 * const foo = something;
 * ```
 */

export declare function makeOptionsSchema<O extends OptionsData>(): <T extends OptionsSchema<O>>(val: T) => T;
export declare function makeAcceptsFlags<O extends OptionsData>(): <T extends AcceptsFlags<O>>(val: T) => T;
export declare function makeProcessorConfig<P extends AnyPayload>(): <T extends ProcessorConfig<P>>(val: T) => T;
export declare function makeDependencyConfig<T extends DependencyConfig = DependencyConfig>(val: T): T;

/**
 * PLUGIN API.
 */

export type PluginModule = (plugin: Plugin) => void;

export interface Plugin {
	registerProcessor<Payload extends AnyPayload = AnyPayload>(name: string, config: ProcessorConfig<Payload>): void;
	registerDependency(name: string, config: DependencyConfig): void;
}

export type Processor = (payload: any, utils?: ProcessorUtils) => Promise<void>;

export type PayloadData<
	Options extends OptionsData | undefined = undefined,
	Accepts extends AcceptsFlags<any> | undefined = undefined,
	Extra extends OptionsData = {}
> = {
	readonly id: string;
	options: Options;
	input: undefined extends Accepts ? undefined : AcceptedItems<Exclude<Accepts, undefined>>;
	inputs: undefined extends Accepts ? undefined : AcceptedItems<Exclude<Accepts, undefined>>[];
} & Extra;

export interface AnyPayload {
	readonly id: string;
	options: OptionsData | undefined;
	input: undefined | Item;
	inputs: undefined | Item[];
	[key: string]: any;
}

export interface AcceptsFlags<O extends OptionsData | undefined = undefined> {
	files?: boolean | string | FileFilter<O> | RegExp | (string | FileFilter<O> | RegExp)[];
	directories?: boolean | string | DirectoryFilter<O> | RegExp | (string | DirectoryFilter<O> | RegExp)[];
	blobs?: boolean | string | BlobFilter<O> | (string | BlobFilter<O>)[];
	strings?: boolean | string | StringFilter<O> | RegExp | (string | StringFilter<O> | RegExp)[];
	urls?: boolean | string | UrlFilter<O> | RegExp | (string | UrlFilter<O> | RegExp)[];
}

export type AcceptedItems<F extends {[key: string]: any}, K = keyof F> = K extends keyof F
	? K extends 'files'
		? ItemFile
		: K extends 'directories'
		? ItemDirectory
		: K extends 'blobs'
		? ItemBlob
		: K extends 'urls'
		? ItemUrl
		: K extends 'strings'
		? ItemString
		: never
	: never;

export type FileFilter<O extends OptionsData | undefined = OptionsData | undefined> = (
	item: ItemFile,
	options: O
) => boolean;
export type DirectoryFilter<O extends OptionsData | undefined = OptionsData | undefined> = (
	item: ItemDirectory,
	options: O
) => boolean;
export type BlobFilter<O extends OptionsData | undefined = OptionsData | undefined> = (
	item: ItemBlob,
	options: O
) => boolean;
export type StringFilter<O extends OptionsData | undefined = OptionsData | undefined> = (
	item: ItemString,
	options: O
) => boolean;
export type UrlFilter<O extends OptionsData | undefined = OptionsData | undefined> = (
	item: ItemUrl,
	options: O
) => boolean;

export interface ProcessorConfig<Payload extends AnyPayload = AnyPayload> {
	main: string;
	description?: string;
	dependencies?: string[];
	optionalDependencies?: string[];
	accepts?: AcceptsFlags<Payload['options']>;
	bulk?: boolean | ((items: Item[], options: Payload['options']) => boolean);
	expandDirectory?: (item: ItemDirectory, options: Payload['options']) => boolean;
	threadType?: string | string[] | ((payload: Payload) => string | string[]);
	threadTypeDescription?: string;
	options?: OptionsSchema<Payload['options']> | OptionsLaxSchema;
	parallelize?: boolean | ((payload: Payload) => boolean);
	keepAlive?: boolean;
	dropFilter?: (items: Item[], options?: Payload['options']) => Item[] | Promise<Item[]>;
	operationPreparator?: (
		payload: Pick<Payload, 'id' | 'options' | 'input' | 'inputs'>,
		utils: PreparatorUtils
	) => Payload | null | undefined | false | void | Promise<Payload | null | undefined | false | void>;
	progressFormatter?: 'bytes' | ((progress: ProgressData) => string); // HTML
	operationMetaFormatter?: (meta: any) => string; // HTML
	profileMetaUpdater?: (profileMeta: any, operationMeta: any) => any;
	profileMetaFormatter?: (meta: any) => string; // HTML
	modifierDescriptions?: {[key: string]: string} | ((options: Payload['options']) => {[key: string]: string});
	instructions?: string;
}

export interface DependencyData<T = unknown> {
	version?: string;
	payload?: T;
}

export interface DependencyConfig {
	load(utils: LoadUtils): Promise<boolean | DependencyData>;
	install?(utils: InstallUtils): Promise<void>;
	instructions?: string;
}

/**
 * OPTIONS.
 */

export type OptionsData = {[key: string]: unknown};
export type InputOptions = {[key: string]: string};

export interface OptionBase<V = any, O extends OptionsData | undefined = OptionsData | undefined> {
	name: string;
	title?: string | false;
	hint?: string | ((value: V, options: O, path: (string | number)[]) => string | number | null | undefined);
	description?: string | ((value: V, options: O, path: (string | number)[]) => string | number | null | undefined);
	isDisabled?: boolean | ((value: V, options: O, path: (string | number)[]) => boolean);
	isHidden?: boolean | ((value: V, options: O, path: (string | number)[]) => boolean);
	isResettable?: boolean;
}

export interface OptionBoolean<O extends OptionsData | undefined = OptionsData | undefined>
	extends OptionBase<boolean, O> {
	type: 'boolean';
	default?: boolean;
}

export type OptionNumber<O extends OptionsData | undefined = OptionsData | undefined> = OptionBase<number | null, O> & {
	type: 'number';
	kind?: 'integer' | 'float';
	default?: number;
	nullable?: boolean;
	min?: number;
	max?: number;
	step?: number;
	softMin?: boolean;
	softMax?: boolean;
	steps?: number[];
};

export interface OptionString<O extends OptionsData | undefined = OptionsData | undefined>
	extends OptionBase<string, O> {
	type: 'string';
	default?: string;
	rows?: number;
	cols?: number;
	min?: number;
	max?: number;
	preselect?: boolean;
	validator?: (value: string, options: O, path: (string | number)[]) => boolean;
	asyncValidator?: (value: string, options: O, path: (string | number)[]) => Promise<boolean>;
	asyncValidatorDebounce?: number;
	validationDependencies?: string[];
}

export interface OptionColor<O extends OptionsData | undefined = OptionsData | undefined>
	extends OptionBase<string, O> {
	type: 'color';
	default?: string;
	formatSelection?: (newValue: string, oldValue: string) => string;
}

export interface OptionPath<O extends OptionsData | undefined = OptionsData | undefined> extends OptionBase<string, O> {
	type: 'path';
	default?: string;
	kind?: 'file' | 'directory';
	filters?: DialogFileFilter[];
	formatSelection?: (newValue: string, oldValue: string) => string;
}

export interface OptionSelect<
	OD extends OptionsData | undefined = OptionsData | undefined,
	O extends (string | number)[] | {[x: string]: string} = (string | number)[] | {[x: string]: string},
	Value = O extends (infer R)[] ? R : keyof O
> extends OptionBase<Value | null, OD> {
	type: 'select';
	default?: Value | Value[];
	options: O;
	nullable?: boolean;
	max?: number;
}

export interface OptionList<
	O extends OptionsData | undefined = OptionsData | undefined,
	S extends OptionString<O> | OptionColor<O> | OptionPath<O> | OptionNumber<O> | OptionSelect<O> =
		| OptionString<O>
		| OptionColor<O>
		| OptionPath<O>
		| OptionNumber<O>
		| OptionSelect<O>
> extends OptionBase<S extends OptionNumber ? number : string, O> {
	type: 'list';
	default?: (S extends OptionNumber ? number : string)[];
	schema: Omit<S, keyof OptionBase>;
}

export interface OptionNamespace<
	O extends OptionsData | undefined = OptionsData | undefined,
	S extends OptionsSchema<O> = OptionsSchema<O>
> extends OptionBase<OptionsData, O> {
	type: 'namespace';
	schema: S;
	default?: OptionsData;
}

export interface OptionCollection<
	O extends OptionsData | undefined = OptionsData | undefined,
	S extends OptionsSchema<O> = OptionsSchema<O>
> extends OptionBase<OptionsData[], O> {
	type: 'collection';
	schema: S;
	default?: OptionsData[];
	itemTitle?: string;
}

export interface OptionDivider<O extends OptionsData | undefined = OptionsData | undefined>
	extends Pick<OptionBase<undefined, O>, 'title' | 'description' | 'isHidden'> {
	type: 'divider';
}

export interface OptionCategory<O extends OptionsData | undefined = OptionsData | undefined>
	extends OptionBase<string, O> {
	type: 'category';
	default?: string;
	options: string[] | InputOptions | ((options: O) => string[] | InputOptions);
}

export type OptionSerializable<O extends OptionsData | undefined = OptionsData | undefined> =
	| OptionBoolean<O>
	| OptionNumber<O>
	| OptionString<O>
	| OptionColor<O>
	| OptionPath<O>
	| OptionSelect<O>
	| OptionList<O>
	| OptionNamespace<O>
	| OptionCollection<O>
	| OptionCategory<O>;
export type OptionSimple<O extends OptionsData | undefined = OptionsData | undefined> =
	| OptionBoolean<O>
	| OptionNumber<O>
	| OptionString<O>
	| OptionColor<O>
	| OptionPath<O>
	| OptionSelect<O>
	| OptionList<O>;
export type OptionDecorative<O extends OptionsData | undefined = OptionsData | undefined> = OptionDivider<O>;
export type OptionSchema<O extends OptionsData | undefined = OptionsData | undefined> =
	| OptionSerializable<O>
	| OptionDecorative<O>;
export type OptionsSchema<O extends OptionsData | undefined = OptionsData | undefined> = OptionSchema<O>[];
export type OptionsLaxSchema = {[x: string]: string | number | boolean | OptionsLaxSchema};

/**
 * ITEMS.
 */

type Variant = 'success' | 'info' | 'warning' | 'danger';

export interface Flair {
	title: string;
	variant?: Variant;
	description?: string;
}

export interface Badge {
	title: string;
	icon: string;
	variant?: Variant;
}

// These are the only items processors deal with
export type Item = ItemFile | ItemDirectory | ItemBlob | ItemString | ItemUrl;

export interface ItemBase {
	readonly id: string;
	readonly created: number;
	flair?: Flair;
	badge?: Badge;
}

export interface ItemFile extends ItemBase {
	kind: 'file';
	type: string; // lowercase extension type without the dot
	path: string;
	size: number;
}
export interface ItemMissingFile extends ItemBase {
	kind: 'missing-file';
	path: string;
	error: string;
}
export interface ItemDirectory extends ItemBase {
	kind: 'directory';
	path: string;
}
export interface ItemMissingDirectory extends ItemBase {
	kind: 'missing-directory';
	path: string;
	error: string;
}
export interface ItemBlob extends ItemBase {
	kind: 'blob';
	mime: string;
	contents: Buffer;
}
export interface ItemString extends ItemBase {
	kind: 'string';
	type: string;
	contents: string;
}
export interface ItemUrl extends ItemBase {
	kind: 'url';
	url: string;
}
export interface ItemError extends ItemBase {
	kind: 'error';
	message: string;
}
export interface ItemWarning extends ItemBase {
	kind: 'warning';
	message: string;
}

/**
 * UTILS.
 */

interface CommonModals {
	alert(data: ModalData): Promise<void>;
	confirm(data: ModalData): Promise<ModalResult<boolean>>;
	prompt(
		data: ModalData,
		stringOptions?: Omit<OptionString, 'title' | 'description' | 'type' | 'name'>
	): Promise<ModalResult<string>>;
	promptOptions<T extends OptionsData | undefined = undefined>(
		data: ModalData,
		schema: OptionsSchema<T>
	): Promise<ModalResult<T>>;
	showOpenDialog(options: OpenDialogOptions): Promise<OpenDialogReturnValue>;
	showSaveDialog(options: SaveDialogOptions): Promise<SaveDialogReturnValue>;
	openModalWindow<T = unknown>(options: string | OpenWindowOptions, payload?: unknown): Promise<ModalWindowResult<T>>;
}

export interface LoadUtils {
	dataPath: string;
}

export type InstallUtils = CommonModals & {
	dataPath: string;
	tmpPath: string;
	/**
	 * Fetch & parse JSON from URL with built in timeout.
	 * Throws when response code is not 200.
	 */
	fetchJson: <T extends unknown = unknown>(url: string, init?: RequestInit & {timeout?: number}) => Promise<T>;
	download: Download;
	extract: Extract;
	cleanup: Cleanup;
	progress: Progress;
	stage: (name: string) => void;
	log: (...args: any[]) => void;
};

export interface Progress {
	(progress?: ProgressData | null): void;
	(completed?: number | null, total?: number | null, indeterminate?: boolean): void;
	data: ProgressData;
	completed: number | undefined;
	indeterminate: boolean | undefined;
	total: number | undefined;
	destroy: () => void;
	toJSON: () => ProgressData;
}

export type ProgressData = {completed?: number; total?: number; indeterminate?: boolean};

export type OutputMeta<T = {}> = T & {
	flair?: Flair;
	badge?: Badge;
};

export interface OutputEmitters {
	file: (path: string, meta?: OutputMeta) => void;
	directory: (path: string, meta?: OutputMeta) => void;
	url: (url: string, meta?: OutputMeta) => void;
	string: (contents: string, meta?: OutputMeta<{type?: string}>) => void;
	error: (error: Error | string, meta?: OutputMeta) => void;
	warning: (message: string, meta?: OutputMeta) => void;
}

export interface ProcessorUtils<Dependencies extends {[key: string]: any} = {[key: string]: any}> {
	dependencies: Dependencies;
	output: OutputEmitters;
	progress: Progress;
	title: (value: string | undefined | null) => void;
	meta: (meta: unknown) => void;
	log: (...args: any[]) => void;
	stage: (name: string) => void;
	appVersion: string;
}

export type PreparatorUtils = CommonModals & {
	modifiers: string;
	action: 'drop' | 'paste';
	title(value: string | undefined | null): void;
	dependencies: {[key: string]: unknown};
	settings: AppSettings;
};

export interface AppSettings {
	fontSize: number;
	compact: boolean;
	theme: 'os' | 'light' | 'dark';
	developerMode: boolean;
	editCommand: string;
}

export interface ModalData {
	variant?: Variant;
	title?: string;
	message?: string;
	details?: string;
}

export interface ModalResult<T = unknown> {
	canceled: boolean;
	payload: T;
	modifiers: string;
}

export interface ModalWindowResult<T = unknown> {
	canceled: boolean;
	payload: T;
}

export interface OpenWindowOptions {
	path: string;
	title?: string;
	/**
	 * Suggested width.
	 */
	width?: number;
	/**
	 * Suggested height.
	 */
	height?: number;
	minWidth?: number;
	minHeight?: number;
}

interface Cleanup {
	(directoryPath: string): Promise<void>;
}

interface Download {
	(url: string | URL, destination: string, options?: DownloadOptions): Promise<string>;
}

export interface DownloadOptions {
	onProgress?: (progress: {completed: number; total?: number}) => void;
	onLog?: (message: string) => void;
	filename?: string;
	timeout?: number;
	signal?: AbortSignal;
}

interface Extract {
	(archivePath: string, destinationPath: string, options: ExtractOptions & {listDetails: true}): Promise<
		ExtractListDetailItem[]
	>;
	(archivePath: string, options: ExtractOptions & {listDetails: true}): Promise<ExtractListDetailItem[]>;
	(archivePath: string, destinationPath: string, options?: ExtractOptions & {listDetails?: false}): Promise<string[]>;
	(archivePath: string, options?: ExtractOptions & {listDetails?: false}): Promise<string[]>;
}

export interface ExtractOptions {
	overwrite?: boolean;
	listDetails?: boolean;
	onLog?: (message: string) => void;
	onProgress?: (progress: ProgressData) => void;
}

export interface ExtractListDetailItem {
	/**
	 * File name.
	 */
	name: string;
	/**
	 * Full path to a file.
	 */
	path: string;
	size: number;
	isDirectory: boolean;
	isFile: boolean;
}

export interface FetchJsonError extends Error {
	status: number;
}

/**
 * TYPING UTILS.
 */

export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

/**
 * Electron interfaces.
 */

interface DialogFileFilter {
	// Docs: https://electronjs.org/docs/api/structures/file-filter

	extensions: string[];
	name: string;
}

interface OpenDialogOptions {
	title?: string;
	defaultPath?: string;
	/**
	 * Custom label for the confirmation button, when left empty the default label will
	 * be used.
	 */
	buttonLabel?: string;
	filters?: DialogFileFilter[];
	/**
	 * Contains which features the dialog should use. The following values are
	 * supported:
	 */
	properties?: Array<
		| 'openFile'
		| 'openDirectory'
		| 'multiSelections'
		| 'showHiddenFiles'
		| 'createDirectory'
		| 'promptToCreate'
		| 'noResolveAliases'
		| 'treatPackageAsDirectory'
		| 'dontAddToRecent'
	>;
	/**
	 * Message to display above input boxes.
	 *
	 * @platform darwin
	 */
	message?: string;
	/**
	 * Create security scoped bookmarks when packaged for the Mac App Store.
	 *
	 * @platform darwin,mas
	 */
	securityScopedBookmarks?: boolean;
}

interface OpenDialogReturnValue {
	/**
	 * whether or not the dialog was canceled.
	 */
	canceled: boolean;
	/**
	 * An array of file paths chosen by the user. If the dialog is cancelled this will
	 * be an empty array.
	 */
	filePaths: string[];
	/**
	 * An array matching the `filePaths` array of base64 encoded strings which contains
	 * security scoped bookmark data. `securityScopedBookmarks` must be enabled for
	 * this to be populated. (For return values, see table here.)
	 *
	 * @platform darwin,mas
	 */
	bookmarks?: string[];
}

interface SaveDialogOptions {
	/**
	 * The dialog title. Cannot be displayed on some _Linux_ desktop environments.
	 */
	title?: string;
	/**
	 * Absolute directory path, absolute file path, or file name to use by default.
	 */
	defaultPath?: string;
	/**
	 * Custom label for the confirmation button, when left empty the default label will
	 * be used.
	 */
	buttonLabel?: string;
	filters?: DialogFileFilter[];
	/**
	 * Message to display above text fields.
	 *
	 * @platform darwin
	 */
	message?: string;
	/**
	 * Custom label for the text displayed in front of the filename text field.
	 *
	 * @platform darwin
	 */
	nameFieldLabel?: string;
	/**
	 * Show the tags input box, defaults to `true`.
	 *
	 * @platform darwin
	 */
	showsTagField?: boolean;
	properties?: Array<
		| 'showHiddenFiles'
		| 'createDirectory'
		| 'treatPackageAsDirectory'
		| 'showOverwriteConfirmation'
		| 'dontAddToRecent'
	>;
	/**
	 * Create a security scoped bookmark when packaged for the Mac App Store. If this
	 * option is enabled and the file doesn't already exist a blank file will be
	 * created at the chosen path.
	 *
	 * @platform darwin,mas
	 */
	securityScopedBookmarks?: boolean;
}

interface SaveDialogReturnValue {
	/**
	 * whether or not the dialog was canceled.
	 */
	canceled: boolean;
	/**
	 * If the dialog is canceled, this will be `undefined`.
	 */
	filePath?: string;
	/**
	 * Base64 encoded string which contains the security scoped bookmark data for the
	 * saved file. `securityScopedBookmarks` must be enabled for this to be present.
	 * (For return values, see table here.)
	 *
	 * @platform darwin,mas
	 */
	bookmark?: string;
}
