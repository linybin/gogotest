# GOGOVAN test

To complete the test specified here 
https://gist.github.com/gilbertwat/90ddb064c2b40597f5e37ec18cea5847


### Prerequisites

* nodejs needs to be installed in your machine 

### Installing

Install dependencies 

```
npm install 
```

Open [localhost:3000](http://localhost:3000/) 
## Running the tests
```
npm test 
```


## Docker
```
docker build -t <your username>/node-web-app .
docker run -p <your port>:3000 -d <your username>/node-web-app
```

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 

## Authors

Ben Lin 


## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

1. RDBMS would be much easilier for this application 
2. For ease of implementation, db credentials are hardcoded 

