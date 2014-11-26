extern crate time;
extern crate http;
extern crate url;
extern crate "conduit-mime-types" as mime;


use std::os;
use std::io::fs::{rename, PathExtensions};
use std::io::net::ip::{SocketAddr, Ipv4Addr};
use std::io::{Writer, File, Command};

use url::Url;

use mime::Types;

use http::server::request::{AbsoluteUri, AbsolutePath};
use http::server::{Config, Server, Request, ResponseWriter};
use http::headers::content_type::MediaType;
use http::status::NotFound;

#[deriving(Clone)]
struct TmailServer {
	ip: std::io::net::ip::IpAddr,
	port: u16,
	root: Path,
	mime: std::sync::Arc<Types>
}

impl TmailServer {
	fn get_real_path(&self, host: Option<http::headers::host::Host>, uri: http::server::request::RequestUri) -> Option<Path> {
		let url = match uri {
			AbsolutePath(ref path) => {
				let uri = host.and_then(|host| {
					let mut uri = "http://".to_string();

					uri.push_str(host.to_string().as_slice());
					uri.push_str(path.as_slice());

					Some(uri.as_slice().clone())
				});

				match uri {
					Some(uri) => {
						Url::parse(uri.as_slice()).ok()
					},
					_ => { None }
				}

			}
			AbsoluteUri(uri) => {
				Some(uri)
			}
			_ => { None }
		};

		url.and_then(|url| {
			match url.path() {
				Some(path_collection) => {
					let path = self.root.clone().join_many(path_collection);

					if self.root.is_ancestor_of(&path) && path.is_file() {
						if url.query == Some("es6".to_string()) {
							Some(compile_js(&self.root, path.clone()))
						} else {
							Some(path)
						}
					} else {
						None
					}
				},
				_ => None
			}
		})
	}

	fn get_mime(&self, path: &Option<Path>) -> Option<MediaType> {
		let mime_str = match path {
			&Some(ref path) => {
				self.mime.mime_for_path(path)
			},
			&None => {
				"text/plain"
			}
		};

		let mut mime_iter = mime_str.split('/');

		Some(MediaType {
			type_: mime_iter.next().unwrap().to_string(),
			subtype: mime_iter.next().unwrap().to_string(),
			parameters: vec!(("charset".to_string(), "UTF-8".to_string()))
		})
	}
}

impl Server for TmailServer {
	fn get_config(&self) -> Config {
		Config { bind_address: SocketAddr { ip: self.ip, port: self.port } }
	}

	fn handle_request(&self, r: Request, w: &mut ResponseWriter) {

		let path = self.get_real_path(r.headers.host.clone(), r.request_uri);

		w.headers.content_type = self.get_mime(&path);

		w.headers.date = Some(time::now_utc());

		match path {
			Some(path) => {
				match File::open(&path).read_to_end() {
					Ok(content) => {
						w.write(content.as_slice()).unwrap();
					}
					Err(_) => {
						w.status = NotFound;
						w.write(b"Page not found").unwrap();
					}
				}
			}
			_ => {
				w.status = NotFound;
				w.write(b"Page not found").unwrap();
			}
		}
	}
}

fn compile_js(root: &Path, path: Path) -> Path {
	let path_traceur = root.join("../utils/traceur/traceur");
	let root_es6 = root.join("../es6");

	path.path_relative_from(&root_es6).and_then(|path| {
		let file_name = std::str::replace(path.as_str().unwrap().slice_from(3), "/", "_");
		Some(root_es6.join(file_name))
	}).and_then(|path_compiled| {
		let compile_result = Command::new(path_traceur.as_str().unwrap())
			.arg("--experimental")
			.args(&["--modules", "inline"])
			.args(&["--out", root.join(path_compiled.filename_str().unwrap()).as_str().unwrap()])
			.arg(path.as_str().unwrap())
			.status();

		match compile_result {
			Ok(code) if code.success() => {
				rename(&root.join(path_compiled.filename_str().unwrap()), &path_compiled).unwrap();
				Some(path_compiled)
			}
			_ => {
				None
			}
		}
	}).or(Some(path)).unwrap()
}

fn main() {
	let server = TmailServer {
		port: 3000,
		ip: Ipv4Addr(127, 0, 0, 1),
		root: os::self_exe_path().unwrap().join("client"),
		mime: std::sync::Arc::new(Types::new().unwrap())
	};
	server.serve_forever();
}
