---
title: "(1) Qt, VSCode and CMake"
date: 2020-12-25T13:31:42+08:00
description:
draft: false
enableToc: true
enableTocContent: false
tocLevels: ["h2", "h3", "h4"]
author: '<a href="https://sky-bro.github.io" class="theme-link">Kyle</a>'
authorEmoji: 🦂
tags:
-
series:
- SocksAB DevLog
categories:
-
image: # images/icons/tortoise.png
libraries:
- mathjax
---
用Vscode和Cmake创建一个简单的qt应用，以后可以当成qt应用的模板使用
模板代码放在[github.com/sky-bro/Qt-Cmake-Example](https://github.com/sky-bro/Qt-Cmake-Example)

<!--more-->

## 工具准备

安装`qt5-base`，`qtcreator`，`cmake`
安装VSCode插件，`CMake`和`CMake Tools`

## CMakeLists.txt说明

### 顶层CMakeLists.txt

首先文件目录结构如下

```txt
.
├── CMakeLists.txt
├── lib
│   ├── add.cpp
│   ├── add.h
│   └── CMakeLists.txt
├── Socks-Alice
│   ├── CMakeLists.txt
│   ├── dialog.cpp
│   ├── dialog.h
│   ├── dialog.ui
│   └── main.cpp
└── Socks-Bob
    ├── CMakeLists.txt
    └── main.cpp
```

有三个子目录，`lib`存放底层逻辑实现，编译成库，给`Socks-Alice`和`Socks-Bob`链接，`Socks-Alice`属于代理软件客户端，有gui，`Socks-Bob`属于代理软件服务端，没有gui。三个子目录也都有自己的CMakeLists.txt文件。

顶层的`CMakeLists.txt`如下，这里主要用来控制整个项目的设置，导入/寻找一些库，以及添加三个子目录`add_subdirectory`

```cmake
cmake_minimum_required(VERSION 3.5)

project(Qt-CMake-Example
        VERSION 1.0
        LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 14)
set(CMAKE_CXX_STANDARD_REQUIRED True)

set(CMAKE_AUTOUIC ON)
set(CMAKE_AUTOMOC ON)
set(CMAKE_AUTORCC ON)

find_package(QT NAMES Qt6 Qt5 COMPONENTS Network Widgets LinguistTools REQUIRED)
find_package(Qt${QT_VERSION_MAJOR} COMPONENTS Network Widgets LinguistTools REQUIRED)

find_package(PkgConfig)
pkg_search_module(BOTAN REQUIRED botan-2>=2.3.0)
find_library(BOTAN_LIBRARY_VAR # /usr/include/botan-2
    NAMES ${BOTAN_LIBRARIES} # botan-2
    HINTS ${BOTAN_LIBRARY_DIRS} ${BOTAN_LIBDIR}) # "" /usr/lib

add_subdirectory(lib)
add_subdirectory(Socks-Alice)
add_subdirectory(Socks-Bob)
```

### lib中的CMakeLists.txt

这里为了示例，只在lib中添加了一个加法函数，放在`add.h`和`add.cpp`中

```c++
// add.h
/**
 * @brief add two numbers together
 * @param a first number
 * @param b second number
 * @returns a+b
 */
int add(int a, int b);

// add.cpp
int add(int a, int b) {
    return a + b;
}
```

`lib`下的CMakeLists.txt如下，这里还给它链接了qt的network库以及第三方的botan-2（一个C++密码库，在顶层的CMakeLists.txt中导入的），通过add_library将其编译成一个库`socksAB`（STATIC默认）

```cmake
set(SOURCE
    add.cpp)

add_library(socksAB ${SOURCE})

target_link_libraries(socksAB
    PUBLIC Qt${QT_VERSION_MAJOR}::Network
    PRIVATE ${BOTAN_LIBRARY_VAR})

target_include_directories(socksAB
    PRIVATE ${BOTAN_INCLUDE_DIRS})
```

### Socks-Alice中的CMakeLists.txt

Socks-Alice中的gui编辑部分可以用qtcreator来做，通常它会自动为我们添加三个文件：`xxx.cpp`，`xxx.h`和`xxx.ui`，但可能需要我们自己手动将它们添加到SOURCE中，如下

```cmake
set(SOURCE
    dialog.cpp
    dialog.h
    dialog.ui
    main.cpp
    )

add_executable(Socks-Alice ${SOURCE})

target_link_libraries(Socks-Alice PRIVATE socksAB)
target_link_libraries(Socks-Alice PRIVATE Qt${QT_VERSION_MAJOR}::Widgets)

target_include_directories(Socks-Alice
    PUBLIC "${PROJECT_BINARY_DIR}"
    "${PROJECT_SOURCE_DIR}/lib"
    PRIVATE ${BOTAN_INCLUDE_DIRS}
    )
```

对应的`main.cpp`（就是简单显示一下这个窗口）

```c++
#include "dialog.h"
#include <QApplication>

int main(int argc, char *argv[])
{
    QApplication a(argc, argv);
    Dialog w;
    w.show();
    return a.exec();
}
```

### Socks-Bob中的CMakeLists.txt

和Socks-Alice类似，但没有链接qt的widget库（因为Socks-Bob放在服务器上，我们不需要GUI）

```cmake
add_executable(Socks-Bob
    main.cpp
    )

target_link_libraries(Socks-Bob socksAB)

target_include_directories(Socks-Bob PUBLIC
                          "${PROJECT_BINARY_DIR}"
                          "${PROJECT_SOURCE_DIR}/lib"
                          PRIVATE ${BOTAN_INCLUDE_DIRS}
                          )
```

这里的main.cpp使用了lib中的add函数，如下

```c++
#include <iostream>

#include "add.h"

using namespace std;

int main(int argc, char const *argv[]) {
  int a, b;
  cout << "hello from Socks-Bob\n";
  cin >> a >> b;
  cout << add(a, b) << endl;
  return 0;
}
```

## 编译与运行

这里可以借助vscode的插件`CMake Tools`或者直接命令行中：

```shell
mkdir build
cd build
cmake ..
make
```

将得到`build`目录结构如下：

```txt
./build
├── CMakeCache.txt
├── CMakeFiles
├── cmake_install.cmake
├── lib
│   ├── CMakeFiles
│   ├── cmake_install.cmake
│   ├── libsocksAB.a
│   ├── Makefile
│   └── socksAB_autogen
├── Makefile
├── Socks-Alice
│   ├── CMakeFiles
│   ├── cmake_install.cmake
│   ├── Makefile
│   ├── Socks-Alice
│   └── Socks-Alice_autogen
└── Socks-Bob
    ├── CMakeFiles
    ├── cmake_install.cmake
    ├── Makefile
    ├── Socks-Bob
    └── Socks-Bob_autogen
```

可以运行相应目录运行`./Socks-Alice`或者`./Socks-Bob`

## 参考

* [cutter.re: Development env setup](https://cutter.re/docs/contributing/code/ide-setup.html)
