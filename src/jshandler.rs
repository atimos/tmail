use std::io::fs::PathExtensions;
use std::io::process::Command;

use hyper::mime::Mime;
use hyper::mime::SubLevel::{Javascript};

use iron::prelude::*;
use iron::{BeforeMiddleware};

use requestpath::{RequestPath};

pub struct JsHandler {
	pub source_root: Path,
	pub compile_root: Path,
	pub compiler: Path
}

impl JsHandler {
	fn is_modified(&self, source: &Path, compiled: &Path) -> bool {
		compiled.stat().map(|compiled_stat| {
			match source.stat() {
				Ok(source_stat) => {
					compiled_stat.modified <= source_stat.modified
				}
				Err(_) if source.filename() == Some(b"runtime.js") => {
					false
				}
				_ => true
			}
		}).unwrap_or(true)
	}

	fn compile(&self, source: &Path, compiled: &Path) {
		Command::new(&self.compiler.as_str().unwrap())
			.arg(self.source_root.as_str().unwrap())
			.arg(source.as_str().unwrap())
			.arg(compiled.as_str().unwrap())
			.output().unwrap();
	}

	fn get_compiled_path(&self, path: Path) -> Path {
		let relative_path = path.path_relative_from(&self.source_root).unwrap();
		let compile_path = self.compile_root.join(relative_path.as_str().unwrap().to_string().replace("/", "_"));

		if self.is_modified(&path, &compile_path) {
			self.compile(&relative_path, &compile_path);
		}
		compile_path
	}
}

impl BeforeMiddleware for JsHandler {
	fn before(&self, req: &mut Request) -> IronResult<()> {
		let path;
		{
			path = req.extensions.get::<RequestPath, RequestPath>().unwrap().clone();
		}

		if path.mime.is_some() {
			let Mime(_, sub, _) = path.mime.clone().unwrap();

			if path.child_of_root && sub == Javascript && !path.path.filename_str().unwrap().contains("min.js") {
				if path.exist || path.path.filename() == Some(b"runtime.js") {
					req.extensions.insert::<RequestPath, RequestPath>(RequestPath {
						mime: path.mime.clone(),
						exist: true,
						child_of_root: path.child_of_root,
						path: self.get_compiled_path(path.path.clone())
					});
				}
			}
		}
		Ok(())
	}
}
