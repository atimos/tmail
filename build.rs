use std::io::Command;
use std::os;

fn main() {
    let src = Path::new(os::getenv("CARGO_MANIFEST_DIR").unwrap()).join("src/client");
    let out = Path::new(os::getenv("OUT_DIR").unwrap()).join("../../../client");
    println!("{} - {}", src.display(),out.display());

    Command::new("ln").args(&["-s", src.as_str().unwrap(), out.as_str().unwrap()]).status().unwrap();
}


