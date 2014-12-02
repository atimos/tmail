#![feature(globs)]
extern crate iron;
extern crate hyper;
extern crate url;
extern crate "conduit-mime-types" as mime;

use requestpath::{RequestPath, RequestPathHandler};

use std::os;
use std::io::File;

use iron::prelude::*;
use iron::ChainBuilder;
use iron::response::modifiers::{Status, Body, ContentType};
use iron::status;

use mime::Types;

mod requestpath;
mod jshandler;

fn tmail(req: &mut Request) -> IronResult<Response> {
	let path = req.extensions.get::<RequestPath, RequestPath>().unwrap();
	let status;

	let body = match path.exist {
		true => {
			match File::open(&path.path).read_to_string() {
				Ok(content) => {
					status = status::Ok;
					content
				},
				Err(err) => {
					status = status::InternalServerError;
					err.desc.to_string()
				}
			}
		}
		false => {
			status = status::NotFound;
			"Page not found".to_string()
		}
	};

	Ok(Response::new()
		.set(Status(status))
		.set(Body(body.as_slice()))
		.set(ContentType(path.mime.clone().unwrap())))
}

fn main() {
	let mut chain = ChainBuilder::new(tmail);
	chain.link_before(RequestPathHandler {
		mime: std::sync::Arc::new(Types::new().unwrap()),
		root: os::self_exe_path().unwrap().join("client")
	});
	chain.link_before(jshandler::JsHandler {
		source_root: os::self_exe_path().unwrap().join("client"),
		transpile_root: os::self_exe_path().unwrap().join("es6"),
		transpiler: os::self_exe_path().unwrap().join("../utils/transpiler/transpiler.js")
	});
	Iron::new(chain).listen("localhost:3000").unwrap();
}
