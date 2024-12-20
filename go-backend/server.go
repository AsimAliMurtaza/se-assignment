package main

import (
	"log"
	"net/http"

	"os"

	"github.com/gin-gonic/gin"
	"github.com/graphql-go/graphql"
	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
)

var db neo4j.Driver

func initNeo4j() (neo4j.Driver, error) {
	uri := os.Getenv("NEO4J_URI")
	password := os.Getenv("NEO4J_PASSWORD")
	auth := neo4j.BasicAuth("neo4j", password, "")
	driver, err := neo4j.NewDriver(uri, auth)
	if err != nil {
		return nil, err
	}
	return driver, nil
}

var itemType = graphql.NewObject(graphql.ObjectConfig{
	Name: "Item",
	Fields: graphql.Fields{
		"id":   &graphql.Field{Type: graphql.String},
		"name": &graphql.Field{Type: graphql.String},
	},
})

var queryType = graphql.NewObject(graphql.ObjectConfig{
	Name: "Query",
	Fields: graphql.Fields{
		"items": &graphql.Field{
			Type: graphql.NewList(itemType),
			Resolve: func(p graphql.ResolveParams) (interface{}, error) {
				session := db.NewSession(neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
				defer session.Close()

				result, err := session.Run("MATCH (i:Item) RETURN i", nil)
				if err != nil {
					return nil, err
				}

				var items []map[string]interface{}
				for result.Next() {
					record := result.Record()
					node, _ := record.Get("i")
					itemNode := node.(*neo4j.Node)
					items = append(items, map[string]interface{}{
						"id":   itemNode.Props["id"],
						"name": itemNode.Props["name"],
					})
				}
				return items, nil
			},
		},
	},
})

var mutationType = graphql.NewObject(graphql.ObjectConfig{
	Name: "Mutation",
	Fields: graphql.Fields{
		"addItem": &graphql.Field{
			Type: itemType,
			Args: graphql.FieldConfigArgument{
				"name": &graphql.ArgumentConfig{
					Type: graphql.NewNonNull(graphql.String),
				},
			},
			Resolve: func(p graphql.ResolveParams) (interface{}, error) {
				name := p.Args["name"].(string)
				session := db.NewSession(neo4j.SessionConfig{AccessMode: neo4j.AccessModeWrite})
				defer session.Close()

				result, err := session.Run(
					"CREATE (i:Item {name: $name}) RETURN i",
					map[string]interface{}{"name": name},
				)
				if err != nil {
					return nil, err
				}

				var createdItem map[string]interface{}
				if result.Next() {
					record := result.Record()
					node, _ := record.Get("i")
					createdItem = map[string]interface{}{
						"id":   node.(neo4j.Node).Props["id"],
						"name": node.(neo4j.Node).Props["name"],
					}
				}
				return createdItem, nil
			},
		},
	},
})

var schema, _ = graphql.NewSchema(graphql.SchemaConfig{
	Query:    queryType,
	Mutation: mutationType,
})

func main() {
	var err error
	db, err = initNeo4j()
	if err != nil {
		log.Fatalf("Error connecting to Neo4j: %v", err)
	}

	r := gin.Default()

	r.POST("/graphql", func(c *gin.Context) {
		var params struct {
			Query string `json:"query"`
		}

		if err := c.BindJSON(&params); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		result := graphql.Do(graphql.Params{
			Schema:        schema,
			RequestString: params.Query,
		})

		if len(result.Errors) > 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": result.Errors})
			return
		}

		c.JSON(http.StatusOK, result)
	})

	r.Run(":8000")
}
