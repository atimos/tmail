extern crate iron;
extern crate http;
extern crate url;

use std::os;
use std::io::File;
use std::io::net::ip::Ipv4Addr;
use http::headers;
use url::Url;
use iron::{Iron, Request, Response, IronResult, Set};
use iron::response::modifiers::{Status, Body};
use iron::status;

fn file(request: &mut Request) -> IronResult<Response> {
	let mut root_path = os::getcwd();
	root_path.push("src/client");
	let root_path = root_path;

	let url = Url::parse(request.url.to_string().as_slice()).ok();

	let content_path = url.and_then(|url| {
		match url.path() {
			Some(path_collection) => {
				let mut path = root_path.clone();

				for part in path_collection.iter() {
					path.push(part);
				}

				Some(path)
			},
			_ => None
		}
	}).and_then(|path| {
		if root_path.is_ancestor_of(&path) {
			Some(path)
		} else {
			None
		}
	}).and_then(|path| {
		let content = File::open(&path).read_to_end();
		match content {
			Ok(content) => { Some((content, path)) }
			Err(_) => None
		}
	});

	match content_path {
		Some((content, path)) => {
			let mut response = Response::new().set(Status(status::Ok)).set(Body(content));

			let (type_, subtype) = match path.extension_str() {
				Some("html") => ("text", "html"),
				Some("css") => ("text", "css"),
				Some("js") => ("application", "javascript"),
				Some("json") => ("application", "json"),
				_ => ("plain", "text")
			};

			response.headers.content_type = Some(headers::content_type::MediaType {
				type_: String::from_str(type_),
				subtype: String::from_str(subtype),
				parameters: Vec::new()
			});

			Ok(response)
		}
		_ => { Ok(Response::new().set(Status(status::NotFound))) }
	}
}

fn main() {
	Iron::new(file).listen(Ipv4Addr(127, 0, 0, 1), 8080);
}
