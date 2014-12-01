use std::sync::Arc;
use std::io::fs::PathExtensions;

use hyper::mime::Mime;

use iron::prelude::*;
use iron::{BeforeMiddleware, typemap};

use mime::Types;


pub struct RequestPathHandler {
	pub root: Path,
	pub mime: Arc<Types>
}


pub struct RequestPath {
    pub mime: Option<Mime>,
	pub exist: bool,
	pub child_of_root: bool,
	pub path: Path
}

impl typemap::Assoc<RequestPath> for RequestPath {}

impl BeforeMiddleware for RequestPathHandler {
	fn before(&self, req: &mut Request) -> IronResult<()> {
		let path = self.root.join_many(req.url.path.as_slice());
        let mut mime = String::from_str(self.mime.mime_for_path(&path));

        mime.push_str(";charset=utf8");

		req.extensions.insert::<RequestPath, RequestPath>(RequestPath {
            mime: from_str(mime.as_slice()),
			exist: path.is_file(),
			child_of_root: self.root.is_ancestor_of(&path),
			path: self.root.join_many(req.url.path.as_slice())
		});

		Ok(())
	}
}
