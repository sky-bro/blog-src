---
title: "LaTex Basics"
date: 2020-05-23T20:14:12+08:00
description: My LaTex CheetSheet
draft: true
hideToc: false
enableToc: true
enableTocContent: false
tocPosition:
tocLevels: ["h2", "h3", "h4"]
author: '<a href="https://sky-bro.github.io" class="theme-link">Kyle</a>'
authorEmoji: 🦂
tags:
-
series:
-
categories:
-
image: images/icons/tortoise.png
libraries:
- mathjax
---
## Preamble and Body

```latex
% #########################
% #######Preamble##########
% #########################

% font size: 10pt (default)
% paper size: a4paper legalpaper letterpaper
\documentclass[12pt, a4paper]{report} % article
% better set utf8 encoding
\usepackage[utf8]{inputenc}

% add \maketitle in the body to include these info
\title{First document}
% will add a foot note for thanks
\author{Hubert Farnsworth \thanks{funded by the Overleaf team}}
% \date{February 2014}
\date{\today}

% #########################
% ###########Body##########
% #########################

\begin{document}

\maketitle

We have now added a title, author and date to our first \LaTeX{} document!

\end{document}

```

## Font Styles: Bold, Italic, Underline

```latex
\documentclass[12pt, a4paper]{report}
\usepackage[utf8]{inputenc}

\begin{document}

First line of the document.

% \\ or \newline or two+ consecutive <Enter> (different from previous two, will add indent at the front) starts a new line
This is \textbf{bolded}. \\
This is \underline{underlined}. \\
This is \textit{italic}. \\
% emph will use proper style according to its context
This is \emph{emphasized (italic)} \\
\textit{
  This is \emph{emphasized (normal)}
} \\
\textbf{
  This is \emph{emphasized (italic \& bold)}
} \\

\end{document}
```

## Include Images

```latex
\documentclass{article}
% need graphicx package
\usepackage{graphicx}
% include the image pathes
% \graphicspath{{subdir1/}{subdir2/}{subdir3/}...{subdirn/}}
\graphicspath{ {./figs/} }

\begin{document}

This is an image of sky.

% you can omit the suffix of the image
% \includegraphics{sky.png}
\includegraphics{sky}

\end{document}
```

## Caption, Label, Ref

```latex
\begin{figure}[h]
    \centering
    \includegraphics[width=0.5\textwidth]{sky} % include sky.png
    \caption{the blue sky}
    \label{fig:sky}
\end{figure}

% \ref{fig:sky} -> figure 1
% \ref{sky} -> 1
As you can see in the figure \ref{fig:sky}, the
function grows near 0. Also, in the page \pageref{fig:sky}
is the same example.
```

## List

```latex
% ordered
\begin{enumerate}
  \item first item
  \item second item
\end{enumerate}

% unordered
begin{itemize}
  \item a item
  \item another item
\end{itemize}
```

## Math

```latex
% inline style
This is inline style: $E=mc^2$.

% display style
This is display style:
\begin{equation}
E=mc^2
\end{equation}
```

## Abstract

```latex
\begin{document}

\begin{abstract}
This will be styled accordingly to the documentclass: article, report, book, ..?
\end{abstract}
\end{document}
```

## Sections

```latex
% -1  \part{part}
%  0  \chapter{chapter}
%  1  \section{section}
%  2  \subsection{subsection}
%  3  \subsubsection{subsubsection}
%  4  \paragraph{paragraph}
%  5  \subparagraph{subparagraph}
% \part and \chapter are only available in report and book document classes.

\chapter{First Chapter}

\section{Introduction}

This is the first section.

Lorem  ipsum  dolor  sit  amet,  consectetuer  adipiscing  
elit.   Etiam  lobortisfacilisis sem.  Nullam nec mi et 
neque pharetra sollicitudin.  Praesent imperdietmi nec ante. 
Donec ullamcorper, felis non sodales...

\section{Second Section}

Lorem ipsum dolor sit amet, consectetuer adipiscing elit.  
Etiam lobortis facilisissem.  Nullam nec mi et neque pharetra 
sollicitudin.  Praesent imperdiet mi necante...

\subsection{First Subsection}
Praesent imperdietmi nec ante. Donec ullamcorper, felis non sodales...

\section*{Unnumbered Section}
Lorem ipsum dolor sit amet, consectetuer adipiscing elit.  
Etiam lobortis facilisissem
```

## Table

```latex
\begin{center}
\begin{tabular}{ c c c }
 cell1 & cell2 & cell3 \\
 cell4 & cell5 & cell6 \\  
 cell7 & cell8 & cell9
\end{tabular}
\end{center}
```
