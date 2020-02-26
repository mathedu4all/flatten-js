"use strict";

import Flatten from '../flatten';
import LinkedList from '../data_structures/linked_list';

/**
 * Class Multiline represent connected path of [edges]{@link Flatten.Edge}, where each edge may be
 * [segment]{@link Flatten.Segment}, [arc]{@link Flatten.Arc}, [line]{@link Flatten.Line} or [ray]{@link Flatten.Ray}
 */
export class Multiline extends LinkedList {
    constructor(...args) {
        super();

        if (args.length === 0) {
            return;
        }

        if (args.length == 1) {
            if (args[0] instanceof Array) {
                let shapes = args[0];
                if (shapes.length == 0)
                    return;

                // TODO: more strict validation:
                // there may be only one line
                // only first and last may be rays
                let validShapes = shapes.every((shape) => {
                    return shape instanceof Flatten.Segment ||
                        shape instanceof Flatten.Arc ||
                        shape instanceof Flatten.Ray ||
                        shape instanceof Flatten.Line
                });

                for (let shape of shapes) {
                    let edge = new Flatten.Edge(shape);
                    this.append(edge);
                }
            }
        }
    }

   /**
     * Split edge and add new vertex, return new edge inserted
     * @param pt
     * @param edge
     * @returns {Edge}
     */
    addVertex(pt, edge) {
        let shapes = edge.shape.split(pt);
        // if (shapes.length < 2) return;

        if (shapes[0] === undefined)   // point incident to edge start vertex, return previous edge
           return edge.prev;

        if (shapes[1] === undefined)   // point incident to edge end vertex, return edge itself
           return edge;

        let newEdge = new Flatten.Edge(shapes[0]);
        let edgeBefore = edge.prev;

        /* Insert first split edge into linked list after edgeBefore */
        this.insert(newEdge, edgeBefore);     // edge.face ?

        // Update edge shape with second split edge keeping links
        edge.shape = shapes[1];

        return newEdge;
    }

    /**
     * Split edges of multiline with intersection points and return mutated multiline
     * @param ip
     * @returns {Multiline}
     */
    split(ip) {
        for (let pt of ip) {
            let edge = this.findEdgeByPoint(pt);
            this.addVertex(pt, edge);
        }
        return this;
    }

    /**
     * Returns edge which contains given point
     * @param {Point} pt
     * @returns {Edge}
     */
    findEdgeByPoint(pt) {
        let edgeFound;
        for (let edge of this) {
            if (edge.shape.contains(pt)) {
                edgeFound = edge;
                break;
            }
        }
        return edgeFound;
    }

    /**
     * Transform multiline into array of shapes
     * @returns {Shape[]}
     */
    toShapes() {
        return this.map(edge => edge.shape.clone())
    }

    toJSON() {
        return this.edges.map(edge => edge.toJSON());
    }

    /**
     * Returns string to be assigned to "d" attribute inside defined "path"
     * TODO: extend for infinite Ray and Line
     * @returns {string}
     */
    svg() {
        let svgStr = `\nM${this.first.start.x},${this.first.start.y}`;
        for (let edge of this) {
            svgStr += edge.svg();
        }
        svgStr += ` z`;
        return svgStr;
    }
}

Flatten.Multiline = Multiline;

/**
 * Shortcut function to create multiline
 * @param args
 */
export const multiline = (...args) => new Flatten.Multiline(...args);
Flatten.multiline = multiline;