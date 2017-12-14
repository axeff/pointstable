# install app
```
  git clone https://github.com/axeff/pointstable.git
  npm install
```

# run app via node
```
  node app --port 3000
```

## 1. open controller part in browser

```
  http://127.0.0.1:3000/input
```

You can control goals and time using keyboard:
  * **1**:      Team left goal down
  * **2**:      Team left goal up
  * **9**:      Team right goal down
  * **0**:      Team right goal up
  * **space**:  play/pause


## 2. open the view-instances as followed

```
  http://127.0.0.1:3000 // one with 127.0.0.1
  http://localhost:3000 // one with localhost

  The app was originally designed to work with different hosts. To separate the viewers we need an identifier, which is - the address
```

You can then set up which viewer should be mirrored under "Monitore" in the controller
