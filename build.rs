use std::io;
use std::io::{Command, fs};
use std::os;

fn main() {
    let root = Path::new(os::getenv("CARGO_MANIFEST_DIR").unwrap());
    let out = Path::new(os::getenv("OUT_DIR").unwrap()).join("../../../");

    fs::mkdir_recursive(&out.join("es6"), io::USER_RWX).unwrap();

    Command::new("ln").args(&["-s", root.join("src/client").as_str().unwrap(), out.as_str().unwrap()]).status().unwrap();
    Command::new("ln").args(&["-s", root.join("utils").as_str().unwrap(), out.as_str().unwrap()]).status().unwrap();
}
