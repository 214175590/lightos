package com.echinacoop.lightos.service.svn;

import java.io.File;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collection;

import org.tmatesoft.svn.core.ISVNDirEntryHandler;
import org.tmatesoft.svn.core.ISVNLogEntryHandler;
import org.tmatesoft.svn.core.SVNCommitInfo;
import org.tmatesoft.svn.core.SVNDepth;
import org.tmatesoft.svn.core.SVNDirEntry;
import org.tmatesoft.svn.core.SVNException;
import org.tmatesoft.svn.core.SVNNodeKind;
import org.tmatesoft.svn.core.SVNProperties;
import org.tmatesoft.svn.core.SVNURL;
import org.tmatesoft.svn.core.internal.io.dav.DAVRepositoryFactory;
import org.tmatesoft.svn.core.internal.io.fs.FSRepositoryFactory;
import org.tmatesoft.svn.core.internal.io.svn.SVNRepositoryFactoryImpl;
import org.tmatesoft.svn.core.io.SVNRepository;
import org.tmatesoft.svn.core.wc.SVNClientManager;
import org.tmatesoft.svn.core.wc.SVNCommitClient;
import org.tmatesoft.svn.core.wc.SVNCopyClient;
import org.tmatesoft.svn.core.wc.SVNCopySource;
import org.tmatesoft.svn.core.wc.SVNInfo;
import org.tmatesoft.svn.core.wc.SVNLogClient;
import org.tmatesoft.svn.core.wc.SVNRevision;
import org.tmatesoft.svn.core.wc.SVNUpdateClient;
import org.tmatesoft.svn.core.wc.SVNWCUtil;
import org.tmatesoft.svn.core.wc2.SvnCat;
import org.tmatesoft.svn.core.wc2.SvnTarget;

import com.echinacoop.lightos.domain.svn.OsSvnUser;

/**
 *
 */
public class SvnUtils {
	private static final String SVN_META_DIR = ".svn";
	private OsSvnUser user;

	public SvnUtils(OsSvnUser user) {
		this.user = user;
		SVNRepositoryFactoryImpl.setup();
		DAVRepositoryFactory.setup();
		FSRepositoryFactory.setup();
	}

	/**
	 * @param srcSvnUri
	 * @param dstSvnUri
	 * @param svnuser
	 * @param svnpasswd
	 * @param localSvnPath
	 * @param commitMessage
	 * @return
	 * @throws SVNException
	 */
	public SVNCommitInfo doPull(String srcSvnUri, String dstSvnUri, String localSvnPath, String commitMessage) throws SVNException {
		SVNNodeKind svnNodeKind = doCheckPath(dstSvnUri);
		if (SVNNodeKind.NONE != svnNodeKind) {
			doCheckoutOrUpdate(localSvnPath, dstSvnUri, svnNodeKind);
			doExport(srcSvnUri, localSvnPath, new String[] { "" });
			return doCommit(new File[] { new File(localSvnPath) }, commitMessage);
		} else {
			return doCopy(srcSvnUri, dstSvnUri, false, commitMessage);
		}
	}

	/**
	 * @param svnuser
	 * @param svnpasswd
	 * @param svnBaseUrl
	 * @param dstPath
	 * @throws SVNException
	 */
	public void doExport(String svnBaseUrl, String localPath, String[] relativePaths) throws SVNException {
		SVNClientManager manager = null;
		try {
			manager = getSVNManager();
			SVNUpdateClient updateClient = manager.getUpdateClient();
			if (null == relativePaths || relativePaths.length == 0) {
				SVNURL svnUrl = SVNURL.parseURIEncoded(svnBaseUrl);
				updateClient.doExport(svnUrl, new File(localPath), SVNRevision.HEAD, SVNRevision.HEAD, null, true, SVNDepth.INFINITY);
			} else
				for (String relativePath : relativePaths) {
					Path dstPath = Paths.get(localPath, relativePath);
					SVNURL svnUrl = SVNURL.parseURIEncoded(svnBaseUrl + relativePath);
					updateClient.doExport(svnUrl, dstPath.toFile(), SVNRevision.HEAD, SVNRevision.HEAD, null, true, SVNDepth.INFINITY);
				}
		} finally {
			if (manager != null) {
				manager.dispose();
			}
		}
	}

	public void doList(String svnuri, SVNRevision revision, SVNDepth depth, ISVNDirEntryHandler handler) throws SVNException {
		SVNClientManager manager = null;
		try {
			manager = getSVNManager();
			SVNURL svnUrl = SVNURL.parseURIEncoded(svnuri);
			SVNLogClient logClient = manager.getLogClient();
			logClient.doList(svnUrl, revision, revision, true, depth, SVNDirEntry.DIRENT_ALL, handler);
		} finally {
			if (manager != null){
				manager.dispose();
			}
		}
	}

	public void doUpdate(File checkoutPath, SVNRevision revision) throws SVNException {
		SVNClientManager manager = null;
		try {
			manager = getSVNManager();
			SVNUpdateClient updateClient = manager.getUpdateClient();
			updateClient.doUpdate(checkoutPath, revision, SVNDepth.INFINITY, false, false);
		} finally {
			if (manager != null){
				manager.dispose();
			}
		}
	}

	public void doCheckout(File checkoutPath, String svnuri, SVNRevision revision) throws SVNException {
		SVNClientManager manager = null;
		try {
			manager = getSVNManager();
			SVNUpdateClient updateClient = manager.getUpdateClient();
			updateClient.doCheckout(SVNURL.parseURIEncoded(svnuri), checkoutPath, revision, revision, SVNDepth.INFINITY, false);
		} finally {
			if (manager != null){
				manager.dispose();
			}
		}
	}

	/**
	 * @param path
	 * @param svnuri
	 * @param svnNodeKind
	 * @throws SVNException
	 */
	public void doCheckoutOrUpdate(String path, String svnuri, SVNNodeKind svnNodeKind) throws SVNException {
		if (svnNodeKind == null){
			svnNodeKind = doCheckPath(svnuri);
		}
		String svnDir = path;
		String svnDirUri = svnuri;
		if (svnNodeKind == SVNNodeKind.FILE) {
			svnDir = Paths.get(path).getParent().toString();
			svnDirUri = svnuri.substring(svnuri.lastIndexOf("/"));
		}
		if (Files.isDirectory(Paths.get(svnDir, SVN_META_DIR))){
			doUpdate(new File(path), SVNRevision.HEAD);
		} else {
			doCheckout(new File(svnDir), svnDirUri, SVNRevision.HEAD);
		}
	}

	public void doDelete(String[] svnuris, String commitMessage) throws SVNException {
		SVNClientManager manager = null;
		try {
			manager = getSVNManager();
			SVNCommitClient commitClient = manager.getCommitClient();
			SVNURL[] urls = new SVNURL[svnuris.length];
			for (int i = 0; i < svnuris.length; i++) {
				urls[i] = SVNURL.parseURIEncoded(svnuris[i]);
			}
			commitClient.doDelete(urls, commitMessage);
		} finally {
			if (manager != null){
				manager.dispose();
			}
		}

	}

	public SVNCommitInfo doCopy(String srcSvnUri, String dstSvnUri, boolean isMove, String commitMessage) throws SVNException {
		SVNClientManager manager = null;
		try {
			manager = getSVNManager();
			SVNCopyClient copyClient = manager.getCopyClient();
			SVNCopySource svnCopySource = new SVNCopySource(SVNRevision.HEAD, SVNRevision.HEAD, SVNURL.parseURIEncoded(srcSvnUri));
			return copyClient.doCopy(new SVNCopySource[] { svnCopySource }, SVNURL.parseURIEncoded(dstSvnUri), isMove, true, false, commitMessage, null);
		} finally {
			if (manager != null){
				manager.dispose();
			}
		}
	}

	public SVNNodeKind doCheckPath(String svnuri) throws SVNException {
		SVNClientManager manager = null;
		try {
			SVNURL svnUrl = SVNURL.parseURIEncoded(svnuri);
			manager = getSVNManager();
			SVNRepository repo = manager.getRepositoryPool().createRepository(svnUrl, false);
			return repo.checkPath("", -1);
		} finally {
			if (manager != null){
				manager.dispose();
			}
		}
	}

	/**
	 * 确定一个URL在SVN上是否存在
	 * 
	 * @param uri
	 * @return
	 * @throws SVNException
	 */
	public boolean doExsit(String svnuri, String svnuser, String svnpasswd) throws SVNException {
		return SVNNodeKind.NONE != doCheckPath(svnuri);
	}

	/**
	 * 本地文件导入到仓库
	 * 
	 * @param srcDir
	 * @param svnurl
	 * @param svnuser
	 * @param svnpasswd
	 * @param commitMessage
	 * @throws SVNException
	 */
	public void doImport(String srcDir, String svnurl, String commitMessage) throws SVNException {
		SVNClientManager manager = null;
		try {
			SVNURL svnUrl = SVNURL.parseURIEncoded(svnurl);
			manager = getSVNManager();
			SVNCommitClient commitClient = manager.getCommitClient();
			commitClient.doImport(new File(srcDir), svnUrl, commitMessage, new SVNProperties(), false, false, SVNDepth.INFINITY);
		} finally {
			if (manager != null){
				manager.dispose();
			}
		}
	}

	/**
	 * @param paths
	 * @param svnuser
	 * @param svnpasswd
	 * @param commitMessage
	 * @return
	 * @throws SVNException
	 */
	public SVNCommitInfo doCommit(File[] paths, String commitMessage) throws SVNException {
		SVNClientManager manager = null;
		try {
			manager = getSVNManager();
			SVNCommitClient commitClient = manager.getCommitClient();
			return commitClient.doCommit(paths, false, commitMessage, null, null, false, false, SVNDepth.INFINITY);
		} finally {
			if (manager != null){
				manager.dispose();
			}
		}
	}

	/**
	 * 获取svn的paths在版本区间内的日志记录
	 * 
	 * @param url
	 * @param svnuser
	 * @param svnpasswd
	 * @param paths
	 * @param startRevision
	 * @param endRevision
	 * @param limit
	 * @param handler
	 * @throws SVNException
	 */
	public void doLog(SVNURL url, String[] paths, SVNRevision startRevision, SVNRevision endRevision, long limit, final ISVNLogEntryHandler handler) throws SVNException {
		SVNClientManager manager = null;
		try {
			manager = getSVNManager();
			manager.getLogClient().doLog(url, paths, SVNRevision.HEAD, startRevision, endRevision, false, true, limit, handler);
		} finally {
			if (manager != null){
				manager.dispose();
			}
		}
	}

	/**
	 * 获取svn仓库信息 checkoutPath和url有一个为非空
	 * 
	 * @param checkoutPath
	 * @param url
	 * @param svnuser
	 * @param svnpasswd
	 * @param revision
	 * @return
	 * @throws SVNException
	 */
	public SVNInfo doGetInfo(File checkoutPath, SVNURL url, SVNRevision revision) throws SVNException {
		SVNClientManager manager = null;
		try {
			manager = getSVNManager();
			if (checkoutPath != null){
				return manager.getWCClient().doInfo(checkoutPath, revision);
			}
			return manager.getWCClient().doInfo(url, revision, revision);
		} finally {
			if (manager != null){
				manager.dispose();
			}
		}
	}

	/**
	 * 回滚
	 * 
	 * @param checkoutPath
	 * @param svnuser
	 * @param svnpasswd
	 * @param revision
	 * @throws SVNException
	 */
	public void doRollback(File checkoutPath, SVNRevision revision) throws SVNException {
		if (SVNRevision.HEAD.equals(revision) || doGetInfo(checkoutPath, null, SVNRevision.HEAD).getRevision().equals(revision)) {
			doRevert(new File[] { checkoutPath }, null);
		} else {
			doUpdate(checkoutPath, revision);
		}
	}

	/**
	 * svn目录恢复
	 * 
	 * @param paths
	 * @param svnuser
	 * @param svnpasswd
	 * @param changeLists
	 * @throws SVNException
	 */
	public void doRevert(File[] paths, Collection<String> changeLists) throws SVNException {
		SVNClientManager manager = null;
		try {
			manager = getSVNManager();
			manager.getWCClient().doRevert(paths, SVNDepth.fromRecurse(true), changeLists);
		} finally {
			if (manager != null){
				manager.dispose();
			}
		}
	}

	/**
	 * 获取SVNClientManager实例
	 * 
	 * @param svnuser
	 * @param svnpasswd
	 * @return
	 */
	private SVNClientManager getSVNManager() {
		SVNClientManager manager = SVNClientManager.newInstance(SVNWCUtil.createDefaultOptions(true), "wangyuancheng", "wangyuancheng");
		return manager;
	}

	/**
	 * 获取svn文件内容
	 * 
	 * @param svnuri
	 * @param svnuser
	 * @param svnpasswd
	 * @param revision
	 * @param dst
	 * @throws SVNException
	 */
	public void doGetFileContent(SVNURL uri, SVNRevision revision, OutputStream dst) throws SVNException {
		SVNClientManager manager = null;
		try {
			manager = getSVNManager();
			SvnCat cat = manager.getWCClient().getOperationsFactory().createCat();
			if (revision == null){
				revision = SVNRevision.HEAD;
			}
			cat.setSingleTarget(SvnTarget.fromURL(uri));
			cat.setRevision(revision);
			cat.setOutput(dst);
			cat.run();
		} finally {
			if (manager != null){
				manager.dispose();
			}
		}
	}
	
	/**
	 * 获取两个版本的差异
	 * 
	 * @param paths
	 * @param svnuser
	 * @param svnpasswd
	 * @param changeLists
	 * @throws SVNException
	 */
	public void doDiff(SVNURL url, SVNRevision v1, SVNRevision v2, OutputStream outputStream) throws SVNException {
		SVNClientManager manager = null;
		try {
			manager = getSVNManager();
			manager.getDiffClient().doDiff(url, v1, url, v2, SVNDepth.UNKNOWN, true, outputStream);
		} finally {
			if (manager != null){
				manager.dispose();
			}
		}
	}


}
