**Archived: ["Barrels now are far less useful and have been removed from the style guide; they remain valuable but are not a matter of Angular style."](https://github.com/angular/angular/issues/13193#issuecomment-308264420) They also cause [issues with circular dependencies, when accidently referenced from inside themselves](https://github.com/angular/angular-cli/issues/7369#issuecomment-322192978).**

# ng-barrel [![npm version](https://badge.fury.io/js/ng-barrel.svg)](https://badge.fury.io/js/ng-barrel) 

**ng-barrel** is a small CLI tool, that takes the output of `ng generate` commands
and adds the new service / component / ... to the closest `index.ts` file.

## Installation

```bash
npm i -g ng-barrel
```

You can now pipe `ng generate` output into `ng-barrel` or `ngb`.

## Example

```bash
└───src
    ├───app
    │   └───foo
    │       └───components
    |           └───index.ts
    ...
```

```bash
$ ng generate component foo/components/example Example | ng-barrel
Angular:
        CREATE src/app/foo/components/example/example.component.html (26 bytes)
        CREATE src/app/foo/components/example/example.component.spec.ts (635 bytes)
        CREATE src/app/foo/components/example/example.component.ts (273 bytes)
        CREATE src/app/foo/components/example/example.component.css (0 bytes)
        UPDATE src/app/app.module.ts (4077 bytes)

NgBarrel:
        export * from './example/example.component'; >> src/app/foo/components/index.ts
```

```bash
└───src
    ├───app
    │   └───foo
    │       └───components
    │           │   index.ts
    │           └───example
    │                   example.component.css
    │                   example.component.html
    │                   example.component.spec.ts
    │                   example.component.ts
    ...
```

```bash
$ cat src/app/foo/components/index.ts
export * from './example/example.component';

```

## How it works

**ng-barrel** takes the CLI output and searches for newly created `.ts` files (excluding `.spec.ts`) 
and adds all their exports to the closest barrel.

To find the closest barrel the tools starts from the newly created file and traverses upwards.
The first barrel file will be used.

By default it searches for `index.ts`. You can change this behaviour via `--barrel / -b`.
With this option you can use it for Angular libraries as well:

```bash
ng g s services/foo Foo --project=my-lib | ng-barrel --barrel public_api.ts
```

## Creating missing barrels

You can also pass a relative path as an argument to specify where a barrel file should be created.
If this argument is specified it takes priority over tree traversing.

If a barrel file at the specified path already exists, the export will be appended.
Otherwise a new file will be written.

The argument should be a path relative to the created TS files.

```bash
$ ng g s foo/services/Data data | ngb .
Angular:
        CREATE src/app/foo/services/data.service.spec.ts (323 bytes)
        CREATE src/app/foo/services/data.service.ts (133 bytes)

NgBarrel:
        export * from './data.service'; >> src\app\foo\services\index.ts (NEW)
```

```bash
└───src
    ├───app
    │   └───foo
    │       ├───components
    │       │   └─── ...
    │       └───services
    │               data.service.spec.ts
    │               data.service.ts
    │               index.ts
    ...
```
