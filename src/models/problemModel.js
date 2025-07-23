const mongoose = require('mongoose');
const {Schema} = mongoose;

const problemSchema = new Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    difficulty:{
        type:String,
        enum: ['Easy','Medium','Hard'],
        required:true
    },
    tags: {
    type: [String],
    enum: [
        "Array",
        "Linked Lists",
        "Stacks",
        "Queues",
        "Hash Maps",
        "Hash Sets",
        "Trees",
        "Binary Search Trees",
        "Heaps",
        "Graphs",
        "Recursion",
        "Dynamic Programming",
        "Greedy Algorithms",
        "Divide and Conquer",
        "Sorting",
        "Searching",
        "Bit Manipulation",
        "Two Pointers",
        "Sliding Window",
        "Backtracking",
        "Trie",
        "Graph Traversal (DFS/BFS)",
        "Union-Find",
        "Segment Tree",
        "Fenwick Tree",
        "Topological Sorting",
        "Kadane’s Algorithm",
        "Kruskal’s Algorithm",
        "Dijkstra’s Algorithm",
        "Floyd-Warshall Algorithm",
        "Bellman-Ford Algorithm",
        "Algorithms",
        "KMP Algorithm",
        "Rabin-Karp Algorithm",
        "Boyer-Moore Algorithm",
        "Mathematics", "Basic Operations","BFS","DFS","Data Structures","Strings","Recursion","Binary Search"
    ],
    required:true
},
visibleTestCases:[ 
    {
        input:{
            type:String,
            required:true,
        },
        output:{
            type:String,
            required:true,
        },
        explanation:{
            type:String,
            required:true,
        }
    }
],
HiddenTestCases:[
    {
        input:{
            type:String,
            required:true,
        },
        output:{
            type:String,
            required:true,
        }
    }
],
startCode:[
    {
    language:{
        type:String,
        required:true,
    },
    initialCode:{
        type:String,
        required:true
    }
    }
],
problemCreator:{
    type:Schema.Types.ObjectId,
    ref:'user',
    required:true,
},
referenceCode:[
    {
        language:{
            type:String,
            enum:["C++","Java","JavaScript"],
            required:true
        },
        completeCode:{
            type:String,
            required:true
        }
    }
],
constraints:{
    type:String,
    required:true
},
followUpQuestion:{
    type:String,
},
hints:{
   type:[String] 
}
},{
    timestamps:true
});

const problem = mongoose.model("problem",problemSchema);

module.exports = problem;