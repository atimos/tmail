use std::io::fs::PathExtensions;
use std::io::process::Command;

use hyper::mime::Mime;
use hyper::mime::SubLevel::{Javascript};

use iron::prelude::*;
use iron::{BeforeMiddleware};

use requestpath::{RequestPath};

pub struct JsHandler {
	pub source_root: Path,
	pub transpile_root: Path,
	pub transpiler: Path
}

impl JsHandler {
	fn is_modified(&self, source: &Path, transpiled: &Path) -> bool {
		transpiled.stat().map(|transpiled_stat| {
			match source.stat() {
				Ok(source_stat) => {
					transpiled_stat.modified < source_stat.modified
				}
				Err(_) if source.filename() == Some(b"runtime.js") => {
					false
				}
				_ => true
			}
		}).unwrap_or(true)
	}

	fn transpile(&self, source: &Path, transpiled: &Path) {
		Command::new(&self.transpiler.as_str().unwrap())
			.arg(self.source_root.as_str().unwrap())
			.arg(source.path_relative_from(&self.source_root).unwrap().as_str().unwrap())
			.arg(transpiled.as_str().unwrap())
			.output().unwrap();
	}

	fn get_transpiled_path(&self, path: &Path) -> Path {
		let relative_path = path.path_relative_from(&self.source_root).unwrap();
		let transpile_path = self.transpile_root.join(relative_path.as_str().unwrap().to_string().replace("/", "_"));
		transpile_path
	}
}

impl BeforeMiddleware for JsHandler {
	fn before(&self, req: &mut Request) -> IronResult<()> {
		let path = req.extensions.get::<RequestPath, RequestPath>().unwrap().clone();

		if path.child_of_root {
			if path.path.extension() == Some(b"map") && path.child_of_root {
				let transpiled_path = self.get_transpiled_path(&path.path).with_extension("map");
				req.extensions.insert::<RequestPath, RequestPath>(RequestPath {
					mime: from_str("application/javascript;charset=utf8"),
					exist: transpiled_path.is_file(),
					child_of_root: path.child_of_root,
					path: transpiled_path
				});
			} else {
				match path.mime.clone() {
					Some(Mime(_, ref sub, _)) if sub == &Javascript => {
						if path.exist || path.path.filename() == Some(b"runtime.js") {
							let transpiled_path = self.get_transpiled_path(&path.path);

							if self.is_modified(&path.path, &transpiled_path) {
								self.transpile(&path.path, &transpiled_path);
							}

							req.extensions.insert::<RequestPath, RequestPath>(RequestPath {
								mime: path.mime.clone(),
								exist: true,
								child_of_root: path.child_of_root,
								path: transpiled_path
							});
						}
					}
					_ => {}
				}
			}
		}
		Ok(())
	}
}
