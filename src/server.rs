extern crate iron;
extern crate http;

use std::os;
use std::io::File;
use std::io::net::ip::Ipv4Addr;
use http::headers;
use iron::{Iron, Request, Response, IronResult};
use iron::status;

fn file(request: &mut Request) -> IronResult<Response> {
	let url = request.url.to_string();
	let url = url.as_slice();

	let content_path = url.find(':').and_then(|pos| {
		Some(url.slice_from(pos + 3))
	}).and_then(|path| {
		path.find('/').and_then(|pos| {
			Some(Path::new(path.slice_from(pos + 1)))
		})
	}).and_then(|path| {
		let mut root = os::getcwd();
		root.push("src/client");

		let mut real = root.clone();

		if path == Path::new(".") {
			real.push("index.html");
		}

		real.push(path);

		if root.is_ancestor_of(&real) {
			Some(real)
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
			let mut response = Response::with(status::Ok, content);

			let (type_, subtype) = match path.extension_str() {
				Some("html") => ("text", "html"),
				Some("css") => ("text", "css"),
				Some("js") => ("application", "javascript"),
				_ => ("plain", "text")
			};

			response.headers.content_type = Some(headers::content_type::MediaType {
				type_: String::from_str(type_),
				subtype: String::from_str(subtype),
				parameters: Vec::new()
			});

			Ok(response)
		}
		_ => { Ok(Response::status(status::NotFound)) }
	}
}

fn main() {
	Iron::new(file).listen(Ipv4Addr(127, 0, 0, 1), 8080);
}
