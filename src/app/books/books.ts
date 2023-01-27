import { declareRecordByInitializer } from "../../utils/utils";
import { attributeNames } from "../users/types";
import type { BookData } from "./types";

export const BOOKS_DATA: Readonly<Array<BookData>> = [
  {
    title: "Cracking the Coding Interview",
    author: "Gayle Laakmann McDowell",
    goodFor: "Improving reasoning",
    description: `
Now in the 5th edition, Cracking the Coding Interview gives you the interview preparation you need to get the top software developer jobs. This is a deeply technical book and focuses on the software engineering skills to ace your interview. The book is over 500 pages and includes 150 programming interview questions and answers, as well as other advice.

For the widest degree of readability, the solutions are almost entirely written with Java (with the exception of C / C++ questions). A link is provided with the book so that you can download, compile, and play with the solutions yourself.
      `,
    id: 0,
    hoursToRead: 10,
    baseXPGain: declareRecordByInitializer(attributeNames, (attributeName) => {
      switch (attributeName) {
        case "penPaperCare":
          return 1;
        case "implementationCare":
          return 0.3;
        case "implementationSpeed":
          return 0.1;
        case "reading":
          return 0.5;
        default:
          return 0.3;
      }
    }),
    imageURL:
      "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1391311964i/12544648.jpg",
  },

  {
    title: "Clean Code",
    author: "Robert C. Martin",
    goodFor: "Coding clean code slowly",
    description: `
Even bad code can function. But if code isn't clean, it can bring a development organization to its knees. Every year, countless hours and significant resources are lost because of poorly written code. But it doesn't have to be that way.

Noted software expert Robert C. Martin presents a revolutionary paradigm with Clean Code: A Handbook of Agile Software Craftsmanship . Martin has teamed up with his colleagues from Object Mentor to distill their best agile practice of cleaning code on the fly into a book that will instill within you the values of a software craftsman and make you a better programmer but only if you work at it.

What kind of work will you be doing? You'll be reading code - lots of code. And you will be challenged to think about what's right about that code, and what's wrong with it. More importantly, you will be challenged to reassess your professional values and your commitment to your craft.

Clean Code is divided into three parts. The first describes the principles, patterns, and practices of writing clean code. The second part consists of several case studies of increasing complexity. Each case study is an exercise in cleaning up code - of transforming a code base that has some problems into one that is sound and efficient. The third part is the payoff: a single chapter containing a list of heuristics and "smells" gathered while creating the case studies. The result is a knowledge base that describes the way we think when we write, read, and clean code.
    `,
    id: 1,
    hoursToRead: 9,
    baseXPGain: {
      reading: 0.1,
      penPaperCare: 0.7,
      implementationSpeed: -1,
      implementationCare: 1,
    },
    imageURL:
      "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1436202607i/3735293.jpg",
  },
  {
    title: "Introduction to Algorithms",
    author:
      "Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein",
    goodFor: "Everything",
    description: `
A comprehensive update of the leading algorithms text, with new material on matchings in bipartite graphs, online algorithms, machine learning, and other topics.

Some books on algorithms are rigorous but incomplete; others cover masses of material but lack rigor. Introduction to Algorithms uniquely combines rigor and comprehensiveness. It covers a broad range of algorithms in depth, yet makes their design and analysis accessible to all levels of readers, with self-contained chapters and algorithms in pseudocode. Since the publication of the first edition, Introduction to Algorithms has become the leading algorithms text in universities worldwide as well as the standard reference for professionals.
    `,
    id: 2,
    hoursToRead: 20,
    baseXPGain: declareRecordByInitializer(
      attributeNames,
      (_attributeName) => 0.3
    ),
    imageURL:
      "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1387741681i/108986.jpg",
  },
  {
    title: "Cppreference",
    author: "Bjarne Stroustrup",
    goodFor: "Implementation",
    description: "The documentation.",
    id: 3,
    hoursToRead: 50,
    baseXPGain: {
      reading: 0.2,
      implementationSpeed: 0.2,
      implementationCare: 0.2,
    },
    imageURL: "/cpp-logo.svg",
  },
  {
    title: "Competitive Programmer's Handbook",
    author: "Antti Laaksonen",
    goodFor: "Mainly theory",
    description:
      "Competitive Programmer's Handbook is a modern introduction to competitive programming. The book discusses programming tricks and algorithm design techniques relevant in competitive programming.",
    id: 4,
    hoursToRead: 6,
    baseXPGain: declareRecordByInitializer(attributeNames, (attributeName) => {
      switch (attributeName) {
        case "penPaperCare":
          return 0.1;
        case "implementationCare":
          return 0.1;
        case "implementationSpeed":
          return 0.1;
        case "reading":
          return 0.2;
        default:
          return 1.5;
      }
    }),
  },
  {
    title: "Grokking Algorithms",
    author: "Aditya Y. Bhargava",
    goodFor: "Mainly theory",
    description: `
An algorithm is nothing more than a step-by-step procedure for solving a problem. The algorithms you'll use most often as a programmer have already been discovered, tested, and proven. If you want to take a hard pass on Knuth's brilliant but impenetrable theories and the dense multi-page proofs you'll find in most textbooks, this is the book for you. This fully-illustrated and engaging guide makes it easy for you to learn how to use algorithms effectively in your own programs.

Grokking Algorithms is a disarming take on a core computer science topic. In it, you'll learn how to apply common algorithms to the practical problems you face in day-to-day life as a programmer. You'll start with problems like sorting and searching. As you build up your skills in thinking algorithmically, you'll tackle more complex concerns such as data compression or artificial intelligence.
    `,
    id: 5,
    hoursToRead: 3,
    baseXPGain: declareRecordByInitializer(attributeNames, (attributeName) => {
      switch (attributeName) {
        case "penPaperCare":
          return 0.05;
        case "implementationCare":
          return 0.05;
        case "implementationSpeed":
          return 0.1;
        case "reading":
          return 0.1;
        default:
          return 0.4;
      }
    }),
    imageURL:
      "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1458747997i/22847284.jpg",
  },
  {
    title: "Atomic habits",
    author: "James Clear",
    goodFor: "Everything",
    description: `
No matter your goals, Atomic Habits offers a proven framework for improving—every day. James Clear, one of the world's leading experts on habit formation, reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.

If you're having trouble changing your habits, the problem isn't you. The problem is your system. Bad habits repeat themselves again and again not because you don't want to change, but because you have the wrong system for change. You do not rise to the level of your goals. You fall to the level of your systems. Here, you'll get a proven system that can take you to new heights.
    `,
    id: 6,
    hoursToRead: 6,
    baseXPGain: declareRecordByInitializer(
      attributeNames,
      (_attributeName) => 0.5
    ),
    imageURL:
      "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1655988385i/40121378.jpg",
  },
  {
    title: "Programming Challenges",
    author: "Steven S. Skiena, Miguel A. Revilla",
    goodFor: "Mainly theory",
    description: `
    This book is a comprehensive guide to training for programming contests. It includes an introduction to the basic problems and techniques, as well as a collection of over 300 challenging practice problems with solutions. The book is designed to be used both as a training tool and as a reference guide.

    The book covers a wide range of topics, including data structures, algorithms, graph theory, and number theory. It also includes chapters on advanced topics such as dynamic programming, backtracking, and heuristics. The problems in the book are organized by topic and difficulty level, making it easy to find the right problem for your skill level.

    With Programming Challenges, you will learn how to think like a competitive programmer and develop the skills you need to succeed in programming contests.
    `,
    id: 7,
    hoursToRead: 7,
    baseXPGain: declareRecordByInitializer(attributeNames, (attributeName) => {
      switch (attributeName) {
        case "reading":
          return 0.1;
        case "penPaperCare":
          return 0.1;
        case "implementationSpeed":
          return 0.2;
        case "implementationCare":
          return 0.2;
        default:
          return 0.4;
      }
    }),
    imageURL:
      "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1387665759i/1041695.jpg",
  },
] as const;
