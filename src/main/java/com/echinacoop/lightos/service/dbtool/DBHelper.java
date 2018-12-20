package com.echinacoop.lightos.service.dbtool;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Vector;

import com.echinacoop.lightos.domain.dbtool.DbTable;
import com.echinacoop.lightos.domain.dbtool.DbTableColumn;
import com.echinacoop.lightos.domain.dbtool.MysqlDbColumn;
import com.yinsin.utils.CommonUtils;

public class DBHelper {

    private DBConnection dbconn = new DBConnection();
    public String schema = "";
    public String dburl = "";
    public String userName = "";
    public String pwd = "";
    
    private DBHelper(){}
    
    public static DBHelper init(String dburl, String userName, String pwd){
    	DBHelper db = new DBHelper();
    	db.dburl = dburl;
    	db.userName = userName;
    	db.pwd = pwd;
    	db.dbconn.setDbInfo(dburl, userName, pwd);
    	String url = dburl.substring(0, dburl.indexOf("?"));
    	db.schema = url.substring(url.lastIndexOf("/") + 1);
    	Connection c = db.dbconn.getConnection();
    	if(null != c){
    		db.dbconn.close();
    		return db;
    	}
    	return null;
    }

    public List<DbTable> getDbTables() {
        List<DbTable> tableList = null;
        String sql = "SELECT * FROM information_schema.tables WHERE table_schema = ?";
        try {
            PreparedStatement stmt = dbconn.getPreparedStatement(sql);
            if (stmt != null) {
                stmt.setString(1, schema);
                ResultSet rs = stmt.executeQuery();
                if (rs != null) {
                    tableList = new ArrayList<DbTable>();
                    DbTable table = null;
                    while (rs.next()) {
                        table = new DbTable();
                        table.setTableSchema(schema).setTableName(rs.getString("table_name"))
                                .setTableComment(rs.getString("table_comment"))
                                .setCreateTime(rs.getTimestamp("create_time"));
                        tableList.add(table);
                    }
                }
                dbconn.close(rs, stmt);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return tableList;
    }

    public List<MysqlDbColumn> getTableColumns(String table) {
        List<MysqlDbColumn> columnList = new ArrayList<MysqlDbColumn>();
        String sql = "SELECT DISTINCT * FROM information_schema.COLUMNS WHERE table_schema = ? AND table_name = ? ORDER BY ORDINAL_POSITION";
        try {
            PreparedStatement stmt = dbconn.getPreparedStatement(sql);
            if (stmt != null) {
                stmt.setString(1, schema);
                stmt.setString(2, table);
                ResultSet rs = stmt.executeQuery();
                if (rs != null) {
                    MysqlDbColumn column = null;
                    while (rs.next()) {
                        column = new MysqlDbColumn();
                        column.setTableSchema(schema).setTableName(table).setColumnName(rs.getString("column_name"))
                                .setColumnType(rs.getString("column_type"))
                                .setColumnDefault(rs.getObject("column_default"))
                                .setColumnKey(rs.getString("column_key"))
                                .setColumnComment(rs.getString("column_comment")).setDataType(rs.getString("data_type"))
                                .setCharacterMaximumLength(rs.getLong("character_maximum_length"))
                                .setCharacterOctetLength(rs.getLong("character_octet_length"))
                                .setExtra(rs.getString("extra")).setIsNullable(rs.getString("is_nullable"))
                                .setPrivileges(rs.getString("privileges"))
                                .setOrdinalPosition(rs.getInt("ordinal_position"));
                        columnList.add(column);
                    }
                }
                dbconn.close(rs, stmt);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return columnList;
    }
    
    public Map<String, List<DbTableColumn>> getMutilTableColumns() {
    	Map<String, List<DbTableColumn>> tableMap = new HashMap<String, List<DbTableColumn>>();
        String sql = "SELECT DISTINCT * FROM information_schema.COLUMNS WHERE table_schema = ? AND table_name in ("
        		+ "SELECT table_name FROM information_schema.tables WHERE table_schema = ?"
        		+ ") ORDER BY table_name, ORDINAL_POSITION";
        try {
            PreparedStatement stmt = dbconn.getPreparedStatement(sql);
            if (stmt != null) {
                stmt.setString(1, schema);
                stmt.setString(2, schema);
                ResultSet rs = stmt.executeQuery();
                if (rs != null) {
                    MysqlDbColumn column = null;
                    List<DbTableColumn> columnList = null;
                    String tempName = "", tname = "";;
                    while (rs.next()) {
                        column = new MysqlDbColumn();
                        tname = rs.getString("table_name");
                        if(!tempName.equals(tname)){
                        	if(columnList != null){
                        		tableMap.put(tempName, columnList);
                        	}
                        	tempName = tname;
                        	columnList = new ArrayList<DbTableColumn>();
                        }
                        column.setTableSchema(schema)
                        	.setTableName(tname)
                    		.setColumnName(rs.getString("column_name"))
                            .setColumnType(rs.getString("column_type"))
                            .setColumnDefault(rs.getObject("column_default"))
                            .setColumnKey(rs.getString("column_key"))
                            .setColumnComment(rs.getString("column_comment"))
                            .setDataType(rs.getString("data_type"))
                            .setCharacterMaximumLength(rs.getLong("character_maximum_length"))
                            .setCharacterOctetLength(rs.getLong("character_octet_length"))
                            .setExtra(rs.getString("extra"))
                            .setIsNullable(rs.getString("is_nullable"))
                            .setPrivileges(rs.getString("privileges"))
                            .setOrdinalPosition(rs.getInt("ordinal_position"));
                        columnList.add(column);
                    }
                    if(columnList != null){
                		tableMap.put(tempName, columnList);
                	}
                }
                dbconn.close(rs, stmt);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return tableMap;
    }

    public Map<String, Object> loadTableData(String sql) throws SQLException {
        Map<String, Object> map = null;
        Vector<Vector<Object>> dataVector = null;
        PreparedStatement stmt = dbconn.getPreparedStatement(sql);
        if (stmt != null) {
            ResultSet rs = stmt.executeQuery();
            if (rs != null) {
                map = new HashMap<String, Object>();
                dataVector = new Vector<Vector<Object>>();
                Vector<Object> vector = null;
                Vector<Object> column = null;
                Object value = null;
                int size = 0;
                int row = 1;
                while (rs.next()) {
                    vector = new Vector<Object>();
                    vector.add(row);
                    row++;
                    try {
                        if(column == null){
                            column = resultSetMetaDataToVector(rs.getMetaData());
                            size =  column.size();
                        }
                        for (int i = 1; i < size; i++) {
                            value = rs.getObject(CommonUtils.objectToString(column.get(i)));
                            if (value == null) {
                                vector.add("null");
                            } else {
                                vector.add(value);
                            }
                        }
                    } catch (Exception e) {
                    }
                    dataVector.add(vector);
                }
                map.put("dataSet", dataVector);
                map.put("feildSet", column);
            }
            dbconn.close(rs, stmt);
        }
        return map;
    }

    private Vector<Object> resultSetMetaDataToVector(ResultSetMetaData rsData) {
        Vector<Object> vector = null;
        try {
            int size = rsData.getColumnCount();
            vector = new Vector<Object>();
            vector.add("序号");
            for (int i = 0; i < size; i++) {
                vector.add(rsData.getColumnName(i + 1));
            }
        } catch (SQLException e) {
            vector = new Vector<Object>();
        }
        return vector;
    }

}
