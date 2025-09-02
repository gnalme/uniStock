using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UniStock.Migrations
{
    /// <inheritdoc />
    public partial class Cusom : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ItemValues_CustomFields_CustomFieldsId",
                table: "ItemValues");

            migrationBuilder.DropForeignKey(
                name: "FK_ItemValues_InventoryFields_FieldId",
                table: "ItemValues");

            migrationBuilder.DropIndex(
                name: "IX_ItemValues_CustomFieldsId",
                table: "ItemValues");

            migrationBuilder.DropColumn(
                name: "CustomFieldsId",
                table: "ItemValues");

            migrationBuilder.AddForeignKey(
                name: "FK_ItemValues_CustomFields_FieldId",
                table: "ItemValues",
                column: "FieldId",
                principalTable: "CustomFields",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ItemValues_CustomFields_FieldId",
                table: "ItemValues");

            migrationBuilder.AddColumn<Guid>(
                name: "CustomFieldsId",
                table: "ItemValues",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ItemValues_CustomFieldsId",
                table: "ItemValues",
                column: "CustomFieldsId");

            migrationBuilder.AddForeignKey(
                name: "FK_ItemValues_CustomFields_CustomFieldsId",
                table: "ItemValues",
                column: "CustomFieldsId",
                principalTable: "CustomFields",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ItemValues_InventoryFields_FieldId",
                table: "ItemValues",
                column: "FieldId",
                principalTable: "InventoryFields",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
